import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { addChat, getChatList } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<NextApiRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req: AuthRequest, res) => {
        const { _id } = req.currentUser
        const chatList = await getChatList(_id)
        res.status(200).json({ data: chatList })
    })
    .post(async (req: AuthRequest, res) => {
        const { _id } = req.currentUser
        const newChat = (await addChat(_id)).toObject()
        res.status(200).json({ data: newChat })
    })

export default router
