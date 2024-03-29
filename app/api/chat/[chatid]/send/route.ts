import { NextRequest } from 'next/server'
import { ChatWithConfig, Message, MessageType } from '@/types/model/chat'
import { createCustomEdgeRouter } from '@/services/middlewares/edge'
import { LANGUAGE_SERP_MAP, checkLanguage, formatMessages, getPlugins } from '@/utils/langchain'
import { SerpAPITool } from '@/utils/langchain/serpApiTool'
import { ImageSearch } from '@/utils/langchain/imageSearch'
import { BrowserPilot } from '@/utils/langchain/browserPilot'
import { GifSearch } from '@/utils/langchain/gifSearch'
import { Dalle } from '@/utils/langchain/dalle'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { LangChainStream, StreamingTextResponse } from 'ai'
import { AgentExecutor } from 'langchain/agents'
import { formatToOpenAIToolMessages } from 'langchain/agents/format_scratchpad/openai_tools'
import { OpenAIToolsAgentOutputParser, type ToolsAgentStep } from 'langchain/agents/openai/output_parser'
import { ConversationChain } from 'langchain/chains'
import { ChatPromptTemplate, MessagesPlaceholder } from 'langchain/prompts'
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { RunnableSequence } from 'langchain/schema/runnable'
import { Tool, WikipediaQueryRun, formatToOpenAITool } from 'langchain/tools'

interface pushMessageOptions {
    chatId: string
    message: Message
    messageId?: string
    needConfig?: boolean
}
const pushMessage = async (req: NextRequest, opt: pushMessageOptions): Promise<ChatWithConfig> => {
    const { chatId, message, messageId, needConfig } = opt || {}
    const authorization = req.headers.get('authorization') || ''
    const response = await fetch(`${req.nextUrl.origin}/api/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({
            message,
            ...(messageId && { messageId }),
            needConfig: +!!needConfig,
        }),
        headers: {
            authorization,
            'Content-Type': 'application/json',
        },
        redirect: 'manual',
    })
    const res = await response.json()
    if (res.errno !== '00000' && res.data) {
        throw new Error(JSON.stringify({ errno: res.errno, errmsg: res.errmsg || '发送消息失败' }))
    }
    return res.data
}

const router = createCustomEdgeRouter<NextRequest, { params: unknown }>()

router.post(async (req) => {
    const chatId = req.nextUrl.searchParams.get('chatid')
    const { message, serpEnabled, temperature = 0, activePlugins } = await req.json()
    const { role, type, content } = message
    if (!chatId) {
        throw new Error(JSON.stringify({ errno: 'A0401', errmsg: '聊天内容不存在', status: 404 }))
    }
    const chatData = await pushMessage(req, { chatId, message: { role, type, content }, needConfig: true })
    // return NextResponse.json(chatData)
    if (!chatData) {
        throw new Error(JSON.stringify({ errno: 'A0404', errmsg: '发送消息失败' }))
    }

    const messageList = chatData.messages.map(formatMessages)

    // add system prompt at top
    const assistantPrompt =
        chatData.preset?.prompt || 'You are a friendly AI assistant. Answer the following questions truthfully and as best as you can.'

    const { stream, handlers } = LangChainStream({
        async onCompletion(text) {
            await storeFinalContent(text)
        },
    })

    // chat gpt llm
    const llm = new ChatOpenAI({
        modelName: 'gpt-4-turbo-preview',
        maxTokens: 500,
        // if preset exists, use preset temperature first
        temperature: chatData.preset ? chatData.preset.temperature : temperature,
        streaming: true,
    })

    // tools for langchain agent
    const tools: Tool[] = getPlugins(
        [
            new ImageSearch(),
            GifSearch,
            new WikipediaQueryRun({ topKResults: 3, maxDocContentLength: 4000 }),
            new BrowserPilot(),
            new Dalle(),
        ],
        activePlugins
    )

    // init serpapi for language
    const serpApiTool = new SerpAPITool(
        {
            ...LANGUAGE_SERP_MAP[checkLanguage(content)],
        },
        `${req.nextUrl.origin}/api/brightdata`,
        {
            headers: { authorization: req.headers.get('authorization') || '' },
        }
    )
    serpEnabled && tools.push(serpApiTool)

    // chat history
    const chatHistory = messageList
        .slice(0, messageList.length - 1)
        .map((m) =>
            m.role == 'system'
                ? new SystemMessage({ content: [m] })
                : m.role == 'user'
                ? new HumanMessage({ content: [m] })
                : new AIMessage({ content: [m] })
        )

    // OpenAI tool agent
    if (tools.length) {
        const modelWithTools = llm.bind({ tools: tools.map(formatToOpenAITool) })
        const prompt = ChatPromptTemplate.fromMessages([
            new MessagesPlaceholder('agent_scratchpad'),
            ['system', `\nYou should not call the same tool twice\nThe UTC time is ${new Date().toString()}.`],
            ['system', assistantPrompt],
            new MessagesPlaceholder('history'),
            ['human', '{input}'],
        ])

        const runnableAgent = RunnableSequence.from([
            {
                input: (i: { input: string; steps: ToolsAgentStep[]; history: BaseMessage[] }) => i.input,
                agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[]; history: BaseMessage[] }) =>
                    formatToOpenAIToolMessages(i.steps),
                history: (i: { input: string; steps: ToolsAgentStep[]; history: BaseMessage[] }) => i.history,
            },
            prompt,
            modelWithTools,
            new OpenAIToolsAgentOutputParser(),
        ]).withConfig({ runName: 'OpenAIToolsAgent' })

        const executor = AgentExecutor.fromAgentAndTools({
            agent: runnableAgent,
            tools,
            maxIterations: 3,
        })

        executor.call({ input: content, history: chatHistory }, [handlers]).catch((err) => {
            console.error(err)
        })
    }
    // base chat agent
    else {
        const chain = new ConversationChain({
            llm,
            prompt: ChatPromptTemplate.fromMessages([
                ['system', `\nThe UTC time is ${new Date().toString()}.`],
                ['system', assistantPrompt],
                ...chatHistory,
                ['human', '{input}'],
            ]),
        })
        chain.call({ input: content }, [handlers]).catch((err) => {
            console.error(err)
        })
    }

    let storePromise: Promise<ChatWithConfig | null> | undefined

    // return a promise to store message
    // in edge functions, store fetch will be aborted if close stream immediately after fetch
    // so, use await or maybe settimeout to close stream once the post request reaches server
    const storeFinalContent = (finalContent: string) => {
        if (!finalContent) {
            return Promise.resolve()
        }
        if (storePromise) {
            return storePromise
        }
        return (storePromise = pushMessage(req, {
            chatId,
            message: {
                role: 'assistant',
                content: finalContent,
                type: MessageType.TEXT,
            },
        }))
    }

    return new StreamingTextResponse(stream)
})

export const runtime = 'edge'

export const POST = router.run
