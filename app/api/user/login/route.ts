import { createCustomRouter } from '@/services/middlewares/customRouter'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { generateJWT } from '@/services/middlewares/auth'
import { formatUserInfo, getUserByName } from '@/services/user'
import Boom from '@hapi/boom'
import { HOSTNAME } from '@/utils/constant'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<DBRequest, { params: unknown }>()

router.use(dbMiddleware).post(async (req, ctx) => {
    const { username, password } = await req.json()
    const user = (await getUserByName(username)).toObject()
    if (password === user.password) {
        const accessToken = await generateJWT(user)
        const res = NextResponse.json(formatUserInfo(user))
        res.cookies.set('AccessToken', accessToken, { domain: HOSTNAME, path: '/' })
        return res
    } else {
        throw Boom.unauthorized('用户名或密码错误')
    }
})

export const POST = router.run
