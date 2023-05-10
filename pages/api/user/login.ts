import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { generateJWT } from '@/services/middlewares/auth'
import { formatUserInfo, getUserByName } from '@/services/user'
import { setCookie } from '@/utils/common'

const { DOMAIN = 'robot-web-evoltonnac.vercel.app' } = process.env

const router = createRouter<NextApiRequest, NextApiResponse>()

router.use(dbMiddleware).post(async (req: DBRequest, res, next) => {
    const { username, password } = req.body
    const user = await (await getUserByName(username)).toObject()
    if (password === user.password) {
        console.info('start token')
        const accessToken = generateJWT(user)
        console.info('end token', accessToken)
        setCookie(res, 'AccessToken', accessToken, { domain: DOMAIN, path: '/' })
        console.info('end setcookie', res)
        res.status(200).json({ data: formatUserInfo(user) })
        next()
    } else {
        res.status(401).json({ errno: 1, errmsg: '用户名或密码错误' })
        next()
    }
})

export default router