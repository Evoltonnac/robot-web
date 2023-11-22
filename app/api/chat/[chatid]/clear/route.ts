import { clearChatById } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import Boom from '@hapi/boom'
import { ErrorData } from '@/types/server/common'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: { chatid: string } }>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req, ctx) => {
        const { chatid } = ctx.params
        const { _id } = req.currentUser
        if (!chatid) {
            throw Boom.notFound<ErrorData>('no chatid', {
                errno: 'A0401',
                errmsg: '聊天内容不存在',
            })
        }
        await clearChatById(_id, chatid.toString())
        return NextResponse.json('success')
    })

export const POST = router.run
