import type { NextApiResponse } from 'next'
import { createRouter } from 'next-connect'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { generateJWT } from '@/services/middlewares/auth'
import { formatUserInfo, getUserByName } from '@/services/user'
import { setCookie } from '@/utils/common'

const { DOMAIN = 'robot-web-evoltonnac.vercel.app' } = process.env

const router = createRouter<DBRequest, NextApiResponse>()

router.use(dbMiddleware).post(async (req, res) => {
    const { username, password } = req.body
    const user = (await getUserByName(username)).toObject()
    if (password === user.password) {
        const accessToken = generateJWT(user)
        setCookie(res, 'AccessToken', accessToken, { domain: DOMAIN, path: '/' })
        res.status(200).json({ data: formatUserInfo(user) })
        res.end()
    } else {
        res.status(401).json({ errno: 1, errmsg: '用户名或密码错误' })
        res.end()
    }
})

export default router.handler()
