import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { clearChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<NextApiRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req: AuthRequest, res, next) => {
        const { chatid } = req.query
        const { _id } = req.currentUser
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await clearChatById(_id, chatid.toString())
        res.status(200).json({ data: chatData })
    })

export default router
