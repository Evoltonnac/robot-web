import type { NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { pushMessages, updataMessage } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req: AuthRequest, res) => {
        const { chatid } = req.query
        const { message, messageId } = req.body
        const { role, type, content } = message
        const { _id } = req.currentUser
        if (!chatid) {
            res.status(404)
            res.end()
            return
        }
        if (messageId) {
            await updataMessage(_id, chatid.toString(), messageId.toString(), { role, type, content })
            res.status(200)
            res.end()
            return
        } else {
            const chatData = await pushMessages(_id, chatid.toString(), [{ role, type, content }])
            if (!chatData) {
                res.status(500)
                res.end()
                return
            }
            res.status(200).json({ data: chatData })
            res.end()
            return
        }
    })

export default router.handler()
