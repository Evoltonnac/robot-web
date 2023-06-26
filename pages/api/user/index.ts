import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware, generateJWT } from '@/services/middlewares/auth'
import { addUser, formatUserInfo } from '@/services/user'
import { setCookie } from '@/utils/common'
import { HOSTNAME } from '@/utils/constant'

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .get(authMiddleware, async (req, res) => {
        const user = req.currentUser
        res.status(200).json(formatUserInfo(user))
        res.end()
    })
    .post(async (req: DBRequest, res) => {
        const { username, password } = req.body
        const newUser = (await addUser(username, password)).toObject()
        const accessToken = generateJWT(newUser)
        setCookie(res, 'AccessToken', accessToken, { domain: HOSTNAME, path: '/' })
        res.status(200).json(formatUserInfo(newUser))
        res.end()
    })

export default router.handler()
