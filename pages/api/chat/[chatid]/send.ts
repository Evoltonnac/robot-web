import { createEdgeRouter } from 'next-connect'
import { DECODER, ENCODER } from '@/utils/shared'
import { Chat, Message, MessageType } from '@/types/model/chat'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { getOpenai } from '@/utils/openai'
import { ChatCompletionRequestMessage } from '@/lib/openai-edge/types/chat'

const pushMessage = async (req: NextRequest, chatId: string, message: Message, messageId?: string): Promise<Chat> => {
    const authorization = req.headers.get('authorization') || ''
    const response = await fetch(`${req.nextUrl.origin}/api/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({
            message,
            ...(messageId && { messageId }),
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
    const chatid = req.nextUrl.searchParams.get('chatid')
    const message = (await req.json()).message
    const { role, type, content } = message
    if (!chatid) {
        return new NextResponse('No chatid', {
            status: 500,
        })
    }
    const chatData = await pushMessage(req, chatid, { role, type, content })
    // return NextResponse.json(chatData)
    if (!chatData) {
        return new NextResponse('Send Fail', {
            status: 500,
        })
    }
    const messageList = chatData.messages.map(({ content, role }) => ({ content, role })) as ChatCompletionRequestMessage[]
    const response = await getOpenai().createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messageList,
        max_tokens: 100,
        temperature: 0,
        stream: true,
    })

    let finalContent = ''
    let isStore = false

    const storeFinalContent = () => {
        if (isStore || !finalContent) {
            return
        }
        isStore = true
        pushMessage(req, chatid, {
            role: 'assistant',
            content: finalContent,
            type: MessageType.TEXT,
        })
    }

    const stream = new ReadableStream({
        async start(controller) {
            const onParse = (event: ParsedEvent | ReconnectInterval) => {
                if (event.type === 'event') {
                    const { data } = event
                    /**
                     * Break if event stream finished.
                     */
                    if (data === '[DONE]') {
                        storeFinalContent()
                        controller.close()
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
                                    storeFinalContent()
                                    controller.close()
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
        cancel() {
            console.log('cancel')
            storeFinalContent()
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

export default router.handler()
