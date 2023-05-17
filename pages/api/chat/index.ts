import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/error'
import { addChat, getChatList } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, res) => {
        const { _id } = req.currentUser
        const chatList = await getChatList(_id)
        res.status(200).json(chatList)
        res.end()
    })
    .post(async (req, res) => {
        const { _id } = req.currentUser
        const newChat = (await addChat(_id)).toObject()
        res.status(200).json(newChat)
        res.end()
    })

export default router.handler()
