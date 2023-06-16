import type { NextApiResponse } from 'next'
import { dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import { deletePresetById, getPresetById, updatePresetById } from '@/services/preset'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .get(async (req, res) => {
        const { presetid } = req.query
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        const presetData = (await getPresetById(presetid.toString())).toObject()
        res.status(200).json(presetData)
        res.end()
    })
    .delete(authMiddleware, async (req, res) => {
        const { _id } = req.currentUser
        const { presetid } = req.query
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        await deletePresetById(_id, presetid.toString())
        res.status(200).json('success')
        res.end()
    })
    .patch(authMiddleware, async (req, res) => {
        const { _id } = req.currentUser
        const { presetid } = req.query
        const { avatar, title, prompt } = req.body
        if (!presetid) {
            throw Boom.notFound<ErrorData>('no presetid', {
                errno: 'A0501',
                errmsg: '预设不存在',
            })
        }
        await updatePresetById(_id, presetid.toString(), { avatar, title, prompt })
        res.status(200).json('success')
        res.end()
    })

export default router.handler()
