import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware, generateJWT } from '@/services/middlewares/auth'
import { addUser, formatUserInfo } from '@/services/user'
import { setCookie } from '@/utils/common'

const { DOMAIN = 'robot-web-evoltonnac.vercel.app' } = process.env

const router = createRouter<NextApiRequest, NextApiResponse>()

router
    .use(dbMiddleware)
    .get(authMiddleware, async (req: AuthRequest, res) => {
        const user = req.currentUser
        res.status(200).json({ data: formatUserInfo(user) })
    })
    .post(async (req: DBRequest, res) => {
        const { username, password } = req.body
        const newUser = (await addUser(username, password)).toObject()
        const accessToken = generateJWT(newUser)
        setCookie(res, 'AccessToken', accessToken, { domain: DOMAIN, path: '/' })
        res.status(200).json({ data: formatUserInfo(newUser) })
    })

export default router
