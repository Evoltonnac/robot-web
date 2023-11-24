import { deleteChatById, getChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: { chatid: string } }>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, ctx) => {
        const { chatid } = ctx.params
        const { _id } = req.currentUser
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        const chatData = (await getChatById(_id, chatid.toString())).toObject()
        return NextResponse.json(chatData)
    })
    .delete(async (req, ctx) => {
        const { _id } = req.currentUser
        const { chatid } = ctx.params
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        await deleteChatById(_id, chatid.toString())
        return NextResponse.json('success')
    })

export const GET = router.run
export const DELETE = router.run
