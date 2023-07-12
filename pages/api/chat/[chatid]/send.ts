import { createEdgeRouter } from 'next-connect'
import { ChatWithConfig, Message, MessageType } from '@/types/model/chat'
import { NextFetchEvent, NextRequest } from 'next/server'
import { getOpenai } from '@/utils/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { errorHandlerEdge } from '@/services/middlewares/edge'

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
    return (await response.json()).data
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
    chatData.preset?.prompt && messageList.unshift({ content: chatData.preset.prompt, role: 'system' })
    const response = await getOpenai().createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messageList,
        max_tokens: 200,
        temperature: 0,
        stream: true,
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

    const stream = OpenAIStream(response, {
        async onCompletion(text) {
            await storeFinalContent(text)
        },
    })

    return new StreamingTextResponse(stream)
})

export const config = {
    runtime: 'edge',
}

export default router.handler({
    onError: errorHandlerEdge,
})
