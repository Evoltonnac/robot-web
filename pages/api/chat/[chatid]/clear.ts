import type { NextApiResponse } from 'next'
import { clearChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/error'
import Boom from '@hapi/boom'
import { ErrorData } from '@/types/server/common'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req, res) => {
        const { chatid } = req.query
        const { _id } = req.currentUser
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        const chatData = (await clearChatById(_id, chatid.toString())).toObject()
        res.status(200).json(chatData)
        res.end()
    })

export default router.handler()
