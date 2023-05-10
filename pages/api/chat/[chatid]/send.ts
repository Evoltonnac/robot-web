import type { NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { pushMessages } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { createChatCompletionWithProxy } from '@/utils/openai'
import { DECODER, ENCODER } from '@/utils/shared'
import { MessageType } from '@/types/model/chat'
import { ChatCompletionRequestMessage } from 'openai'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req: AuthRequest, res, next) => {
        const { chatid } = req.query
        const { message } = req.body
        const { role, type, content } = message
        const { _id } = req.currentUser
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await pushMessages(_id, chatid.toString(), [{ role, type, content }])
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
        const stream = response.data as NodeJS.ReadStream

        let finalContent = ''
        let isStore = false

        const storeFinalContent = () => {
            if (isStore || !finalContent) {
                return
            }
            isStore = true
            pushMessages(_id, chatid.toString(), [
                {
                    role: 'assistant',
                    content: finalContent,
                    type: MessageType.TEXT,
                },
            ])
        }

        const onParse = (event: ParsedEvent | ReconnectInterval) => {
            if (event.type === 'event') {
                const { data } = event
                /**
                 * Break if event stream finished.
                 */
                if (data === '[DONE]') {
                    storeFinalContent()
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
                                storeFinalContent()
                                res.end()
                            }
                        }
                    }
                } catch (e) {
                    throw e
                }
            }
        }
        res.on('close', () => {
            controller.abort()
            stream.destroy()
            storeFinalContent()
            res.end()
        })

        const parser = createParser(onParse)
        for await (const chunk of stream) {
            const decoded = DECODER.decode(chunk as Buffer)

            try {
                const parsed = JSON.parse(decoded)

                if (parsed.hasOwnProperty('error')) controller.abort()
            } catch (e) {}

            parser.feed(decoded)
        }
    })

export default router
