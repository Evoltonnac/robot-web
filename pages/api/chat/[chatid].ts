import { getChatById } from '@/services/chat'
import { dbMiddleware, DBRequest } from '@/utils/db'
import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'

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
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await getChatById(chatid.toString())
        res.status(200).json({ data: chatData })
    })

export default router
