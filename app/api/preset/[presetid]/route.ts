import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import { deletePresetById, getPresetById, updatePresetById } from '@/services/preset'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: { presetid: string } }>()

router
    .use(dbMiddleware)
    .get(async (req, ctx) => {
        const { presetid } = ctx.params
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        const presetData = (await getPresetById(presetid.toString())).toObject()
        return NextResponse.json(presetData)
    })
    .delete(authMiddleware, async (req, ctx) => {
        const { _id } = req.currentUser
        const { presetid } = ctx.params
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        await deletePresetById(_id, presetid.toString())
        return NextResponse.json('success')
    })
    .patch(authMiddleware, async (req, ctx) => {
        const { _id } = req.currentUser
        const { presetid } = ctx.params
        const { avatar, title, prompt, temperature } = await req.json()
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        await updatePresetById(_id, presetid.toString(), { avatar, title, prompt, temperature })
        return NextResponse.json('success')
    })

export const GET = router.run
export const DELETE = router.run
export const PATCH = router.run
