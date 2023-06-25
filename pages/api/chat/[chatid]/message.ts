import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { pushMessages, updataMessage } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import Preset from '@/models/preset'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req: AuthRequest, res) => {
        const { chatid } = req.query
        const { message, messageId, needConfig } = req.body
        const { role, type, content } = message
        const { _id } = req.currentUser
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        if (messageId) {
            await updataMessage(_id, chatid.toString(), messageId.toString(), { role, type, content })
            res.status(200).json('success')
            res.end()
            return
        } else {
            const chatData = await pushMessages(_id, chatid.toString(), [{ role, type, content }])
            if (needConfig) {
                await Preset.populate(chatData, { path: 'preset' })
            }
            res.status(200).json(chatData.toObject())
            res.end()
            return
        }
    })

export default router.handler()
