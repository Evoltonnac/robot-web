import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { clearChatById } from '@/services/chat'
import { dbMiddleware, DBRequest } from '@/utils/db'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.use(dbMiddleware).post(async (req: DBRequest, res, next) => {
    const { chatid } = req.query
    if (!chatid) {
        res.status(404)
        return next()
    }
    const chatData = await clearChatById(chatid.toString())
    res.status(200).json({ data: chatData })
})

export default router
