import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { generateJWT } from '@/services/middlewares/auth'
import { formatUserInfo, getUserByName } from '@/services/user'
import { setCookie } from '@/utils/common'
import Boom from '@hapi/boom'

const { DOMAIN = 'robot-web-evoltonnac.vercel.app' } = process.env

const router = createCustomRouter<DBRequest, NextApiResponse>()

router.use(dbMiddleware).post(async (req, res) => {
    const { username, password } = req.body
    const user = (await getUserByName(username)).toObject()
    if (password === user.password) {
        const accessToken = generateJWT(user)
        setCookie(res, 'AccessToken', accessToken, { domain: DOMAIN, path: '/' })
        res.status(200).json(formatUserInfo(user))
        res.end()
    } else {
        throw Boom.unauthorized('用户名或密码错误')
    }
})

export default router.handler()
