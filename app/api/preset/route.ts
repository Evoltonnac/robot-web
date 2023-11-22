import { createCustomRouter } from '@/services/middlewares/customRouter'
import { addPreset, getPresetList } from '@/services/preset'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: unknown }>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, ctx) => {
        const { _id } = req.currentUser
        const presetList = await getPresetList(_id)
        return NextResponse.json({ presetList })
    })
    .post(async (req, ctx) => {
        const { _id } = req.currentUser
        const { avatar, title, prompt, temperature } = await req.json()
        const newPreset = (await addPreset(_id, { avatar, title, prompt, temperature })).toObject()
        return NextResponse.json(newPreset)
    })

export const GET = router.run
export const POST = router.run
