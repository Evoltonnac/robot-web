import type { NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { deleteChatById, getChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, res, next) => {
        const { chatid } = req.query
        const { _id } = req.currentUser
        if (!chatid) {
            res.status(404)
            return next()
        }
        const chatData = await getChatById(_id, chatid.toString())
        res.status(200).json({ data: chatData })
        res.end()
    })
    .delete(async (req, res, next) => {
        const { _id } = req.currentUser
        const { chatid } = req.query
        if (!chatid) {
            res.status(404)
            return next()
        }
        await deleteChatById(_id, chatid.toString())
        res.status(200).json({ data: null })
        res.end()
    })

export default router
