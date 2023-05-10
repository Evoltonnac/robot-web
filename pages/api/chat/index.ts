import type { NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { addChat, getChatList } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, res) => {
        const { _id } = req.currentUser
        const chatList = await getChatList(_id)
        res.status(200).json({ data: chatList })
        res.end()
    })
    .post(async (req, res) => {
        const { _id } = req.currentUser
        const newChat = (await addChat(_id)).toObject()
        res.status(200).json({ data: newChat })
        res.end()
    })

export default router
