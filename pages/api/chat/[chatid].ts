import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { getChatById, pushMessages } from '@/services/chat'
import { dbMiddleware, DBRequest } from '@/utils/db'
import { createChatCompletionWithProxy } from '@/utils/openai'
import { DECODER, ENCODER } from '@/utils/shared'
import { MessageType } from '@/types/model/chat'
import { ChatCompletionRequestMessage } from 'openai'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

const router = createRouter<NextApiRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .get(async (req: DBRequest, res, next) => {
        const { chatid } = req.query
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await getChatById(chatid.toString())
        res.status(200).json({ data: chatData })
    })
    .post(async (req: DBRequest, res, next) => {
        const { chatid } = req.query
        const { message } = req.body
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await pushMessages(chatid.toString(), [message])
        if (!chatData) {
            res.status(500)
            return next()
        }
        const messageList = chatData.messages.map(({ content, role }) => ({ content, role })) as ChatCompletionRequestMessage[]
        const controller = new AbortController()
        let response = null as any
        response = await createChatCompletionWithProxy(
            {
                model: 'gpt-3.5-turbo-0301',
                messages: messageList,
                temperature: 0,
                stream: true,
            },
            { responseType: 'stream', signal: controller.signal }
        )
        const stream = response.data as NodeJS.ReadableStream

        let finalContent = ''

        const onParse = (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === 'event') {
                const { data } = event
                /**
                 * Break if event stream finished.
                 */
                if (data === '[DONE]') {
                    pushMessages(chatid.toString(), [
                        {
                            role: 'assistant',
                            content: finalContent,
                            type: MessageType.TEXT,
                        },
                    ])
                    res.end()
                    return
                }
                try {
                    const parsed = JSON.parse(data)
                    if (parsed?.choices) {
                        const { choices } = parsed
                        for (const choice of choices) {
                            if (choice?.delta?.role) {
                                res.setHeader('Access-Control-Allow-Origin', '*')
                                res.setHeader('Content-Type', 'text/event-stream;charset=utf-8')
                                res.setHeader('Cache-Control', 'no-cache, no-transform')
                                res.setHeader('X-Accel-Buffering', 'no')
                                res.write(
                                    `data: ${ENCODER.encode(
                                        JSON.stringify({
                                            role: 'assistant',
                                            type: MessageType.TEXT,
                                        })
                                    )}\n\n`
                                )
                            } else if (choice?.delta?.content) {
                                finalContent += choice.delta.content
                                res.write(
                                    `data: ${ENCODER.encode(
                                        JSON.stringify({
                                            content: choice.delta.content,
                                        })
                                    )}\n\n`
                                )
                            }
                            if (choice?.finish_reason === 'length') {
                                pushMessages(chatid.toString(), [
                                    {
                                        role: 'assistant',
                                        content: finalContent,
                                        type: MessageType.TEXT,
                                    },
                                ])
                                res.end()
                            }
                        }
                    }
                } catch (e) {
                    throw e
                }
            }
        }

        const parser = createParser(onParse)
        for await (const chunk of stream) {
            const decoded = DECODER.decode(chunk as Buffer)

            try {
                const parsed = JSON.parse(decoded)

                if (parsed.hasOwnProperty('error')) controller.abort()
            } catch (e) {}

            parser.feed(decoded)
        }

        // stream.on('end', async () => {
        //     if (finalContent) {
        //         const reply = {
        //             type: MessageType.TEXT,
        //             content:finalContent,
        //             role: 'assistant' as const,
        //         }
        //         pushMessages(chatid.toString(), [reply])
        //     }
        // })

        // const content = response.data.choices[0]?.message?.content
        // if (content) {
        //     const reply = {
        //         type: MessageType.TEXT,
        //         content,
        //         role: 'assistant' as const,
        //     }
        //     pushMessages(chatid.toString(), [reply])
        //     res.status(200).json({ data: reply })
        //     return next()
        // }
        // res.status(500)
    })

export default router
