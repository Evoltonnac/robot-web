import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { getChatById, pushMessages } from '@/services/chat'
import { dbMiddleware, DBRequest } from '@/utils/db'
import { createChatCompletionWithProxy, DECODER } from '@/utils/openai'
import { MessageType } from '@/types/model/chat'
import { ChatCompletionRequestMessage } from 'openai'
import { Stream } from 'stream'
import { createParser } from 'eventsource-parser'

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
        let response = null as any
        response = await createChatCompletionWithProxy(
            {
                model: 'gpt-3.5-turbo-0301',
                messages: messageList,
                temperature: 0,
                stream: true,
            },
            { responseType: 'stream' }
        )
        const stream = response.data as Stream
        const finalContent = ''
        stream.on('data', (chunk) => {
            if (chunk) {
                const data = DECODER.decode(chunk).replace(/^\s*data:\s*/, '')
                console.info(Date.now(), data)
                if (data === '[DONE]') {
                    res.end()
                } else {
                    const parsed = JSON.parse(data)
                    const { delta } = (parsed?.choices && parsed.choices[0]) || {}
                    if (delta) {
                    }
                    res.write(chunk)
                }
            }
        })

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
