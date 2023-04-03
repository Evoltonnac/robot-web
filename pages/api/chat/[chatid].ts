import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { getChatById, pushMessages } from '@/services/chat'
import { dbMiddleware, DBRequest } from '@/utils/db'
import { createChatCompletionWithProxy } from '@/utils/openai'
import { MessageType } from '@/types/ui/chat'

const router = createRouter<NextApiRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .get(async (req: DBRequest, res, next) => {
        const collections = await req.dbcon.db.listCollections().toArray()
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
        const messageList = chatData.messages.map(({ content = '', role = '' }) => ({ content, role }))
        const response = await createChatCompletionWithProxy({
            model: 'gpt-3.5-turbo-0301',
            messages: messageList,
            temperature: 0.7,
        })
        const content = response.data.choices[0]?.message?.content
        if (content) {
            const reply = {
                type: MessageType.TEXT,
                content,
                role: 'assistant' as const,
            }
            pushMessages(chatid.toString(), [reply])
            res.status(200).json({ data: reply })
            return next()
        }
        res.status(500)
    })

export default router
