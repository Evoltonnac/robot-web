import { createEdgeRouter } from 'next-connect'
import { DECODER, ENCODER } from '@/utils/shared'
import { ChatWithConfig, Message, MessageType } from '@/types/model/chat'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { NextFetchEvent, NextRequest } from 'next/server'
import { getOpenai } from '@/utils/openai'
import { ChatCompletionRequestMessage } from '@/lib/openai-edge/types/chat'
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
    const messageList = chatData.messages.map(({ content, role }) => ({ content, role })) as ChatCompletionRequestMessage[]
    chatData.preset?.prompt && messageList.unshift({ content: chatData.preset.prompt, role: 'system' })
    const response = await getOpenai().createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messageList,
        max_tokens: 200,
        temperature: 0,
        stream: true,
    })

    let finalContent = ''
    let storePromise: Promise<ChatWithConfig | null> | undefined
    let isStreamClose = false

    // return a promise to store message
    // in edge functions, store fetch will be aborted if close stream immediately after fetch
    // so, use await or maybe settimeout to close after the post request reach server
    const storeFinalContent = () => {
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

    const stream = new ReadableStream({
        async start(controller) {
            const onParse = async (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === 'event') {
                    const { data } = event
                    /**
                     * Break if event stream finished.
                     */
                    if (data === '[DONE]') {
                        await storeFinalContent()
                        !isStreamClose && (isStreamClose = true) && controller.close()
                        return
                    }
                    try {
                        const parsed = JSON.parse(data)
                        if (parsed?.choices) {
                            const { choices } = parsed
                            for (const choice of choices) {
                                if (choice?.delta?.role) {
                                    controller.enqueue(
                                        ENCODER.encode(
                                            `data: ${ENCODER.encode(
                                                JSON.stringify({
                                                    role: 'assistant',
                                                    type: MessageType.TEXT,
                                                })
                                            )}\n\n`
                                        )
                                    )
                                } else if (choice?.delta?.content) {
                                    finalContent += choice.delta.content
                                    controller.enqueue(
                                        ENCODER.encode(
                                            `data: ${ENCODER.encode(
                                                JSON.stringify({
                                                    content: choice.delta.content,
                                                })
                                            )}\n\n`
                                        )
                                    )
                                }
                                if (choice?.finish_reason === 'length') {
                                    await storeFinalContent()
                                    !isStreamClose && (isStreamClose = true) && controller.close()
                                }
                            }
                        }
                    } catch (e) {
                        throw e
                    }
                }
            }

            const parser = createParser(onParse)
            if (response.body) {
                for await (const chunk of response.body as any) {
                    const decoded = DECODER.decode(chunk as Buffer)

                    try {
                        const parsed = JSON.parse(decoded)

                        if (parsed.hasOwnProperty('error')) controller.close()
                    } catch (e) {}

                    parser.feed(decoded)
                }
            }
        },
        cancel: async () => {
            await storeFinalContent()
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream;charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Accel-Buffering': 'no',
        },
    })
})

export const config = {
    runtime: 'experimental-edge',
}

export default router.handler({
    onError: errorHandlerEdge,
})
