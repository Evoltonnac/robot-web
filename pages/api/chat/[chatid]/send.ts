import { createEdgeRouter } from 'next-connect'
import { ChatWithConfig, Message, MessageType } from '@/types/model/chat'
import { NextFetchEvent, NextRequest } from 'next/server'
import { LangChainStream, StreamingTextResponse } from 'ai'
import { errorHandlerEdge } from '@/services/middlewares/edge'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { BufferMemory, ChatMessageHistory } from 'langchain/memory'
import { LANGUAGE_SERP_MAP, checkLanguage } from '@/utils/langchain'
import { SerpAPITool } from '@/utils/langchain/serpApiTool'

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

const router = createEdgeRouter<NextRequest, NextFetchEvent>()

router.post(async (req) => {
    const chatId = req.nextUrl.searchParams.get('chatid')
    const message = (await req.json()).message
    const { role, type, content } = message
    if (!chatId) {
        throw new Error(JSON.stringify({ errno: 'A0401', errmsg: '聊天内容不存在', status: 404 }))
    }
    const chatData = await pushMessage(req, { chatId, message: { role, type, content }, needConfig: true })
    // return NextResponse.json(chatData)
    if (!chatData) {
        throw new Error(JSON.stringify({ errno: 'A0404', errmsg: '发送消息失败' }))
    }
    const messageList = chatData.messages.map(({ content, role }) => ({ content, role }))

    // add system prompt at top
    const prompt = `${
        chatData.preset?.prompt || 'You are a friendly AI assistant. Answer the following questions truthfully and as best as you can.'
    }`
    messageList.unshift({
        role: 'system',
        content: prompt,
    })

    const { stream, handlers } = LangChainStream({
        async onCompletion(text) {
            await storeFinalContent(text)
        },
    })
    const llm = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-0613',
        maxTokens: 500,
        temperature: 0,
        streaming: true,
    })
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
    const memory = new BufferMemory({
        chatHistory: new ChatMessageHistory(
            messageList
                .slice(0, messageList.length - 1)
                .map((m) =>
                    m.role == 'system'
                        ? new SystemMessage(m.content)
                        : m.role == 'user'
                        ? new HumanMessage(m.content)
                        : new AIMessage(m.content)
                )
        ),
        memoryKey: 'chat_history',
        returnMessages: true,
    })
    const agent = await initializeAgentExecutorWithOptions([serpApiTool], llm, {
        agentType: 'openai-functions',
        agentArgs: {
            prefix: `The UTC time is ${new Date().toString()}.`,
        },
        // verbose: true,
        memory,
    })
    agent.call({ input: content }, [handlers]).catch((err) => {
        console.error(err)
    })

    let storePromise: Promise<ChatWithConfig | null> | undefined

    // return a promise to store message
    // in edge functions, store fetch will be aborted if close stream immediately after fetch
    // so, use await or maybe settimeout to close after the post request reach server
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

export const config = {
    runtime: 'edge',
}

export default router.handler({
    onError: errorHandlerEdge,
})
