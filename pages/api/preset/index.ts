import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { addPreset, getPresetList } from '@/services/preset'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .use(authMiddleware)
    .get(async (req, res) => {
        const { _id } = req.currentUser
        const presetList = await getPresetList(_id)
        res.status(200).json({ presetList })
        res.end()
    })
    .post(async (req, res) => {
        const { _id } = req.currentUser
        const { avatar, title, prompt, temperature } = req.body
        const newPreset = (await addPreset(_id, { avatar, title, prompt, temperature })).toObject()
        res.status(200).json(newPreset)
        res.end()
    })

export default router.handler()
