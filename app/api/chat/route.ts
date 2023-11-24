import { createCustomRouter } from '@/services/middlewares/customRouter'
import { addChat, getChatList } from '@/services/chat'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: unknown }>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, ctx) => {
        const { _id } = req.currentUser
        const chatList = await getChatList(_id)
        return NextResponse.json({ chatList })
    })
    .post(async (req, ctx) => {
        const { _id } = req.currentUser
        const { presetId } = await req.json()
        const newChat = (await addChat(_id, presetId)).toObject()
        return NextResponse.json(newChat)
    })

export const GET = router.run
export const POST = router.run
