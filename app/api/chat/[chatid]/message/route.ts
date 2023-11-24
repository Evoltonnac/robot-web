import { createCustomRouter } from '@/services/middlewares/customRouter'
import { pushMessages, updataMessage } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import Preset from '@/models/preset'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: { chatid: string } }>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .post(async (req: AuthRequest, ctx) => {
        const { chatid } = ctx.params
        const { message, messageId, needConfig } = await req.json()
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
            return NextResponse.json('success')
        } else {
            const chatData = await pushMessages(_id, chatid.toString(), [{ role, type, content }])
            if (needConfig) {
                await Preset.populate(chatData, { path: 'preset' })
            }
            return NextResponse.json(chatData.toObject())
        }
    })

export const POST = router.run
