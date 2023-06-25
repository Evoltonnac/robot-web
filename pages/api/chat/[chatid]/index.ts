import type { NextApiResponse } from 'next'
import { deleteChatById, getChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, res) => {
        const { chatid } = req.query
        const { _id } = req.currentUser
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        const chatData = (await getChatById(_id, chatid.toString())).toObject()
        res.status(200).json(chatData)
        res.end()
    })
    .delete(async (req, res) => {
        const { _id } = req.currentUser
        const { chatid } = req.query
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        await deleteChatById(_id, chatid.toString())
        res.status(200).json('success')
        res.end()
    })

export default router.handler()
