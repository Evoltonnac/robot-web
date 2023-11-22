import { createCustomRouter } from '@/services/middlewares/customRouter'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware, generateJWT } from '@/services/middlewares/auth'
import { addUser, editConfig, formatUserInfo, getUserByName } from '@/services/user'
import { HOSTNAME } from '@/utils/constant'
import _ from 'lodash'
import { NextResponse } from '@/services/middlewares/edge'

const router = createCustomRouter<AuthRequest, { params: unknown }>()

router
    .use(dbMiddleware)
    .get(authMiddleware, async (req) => {
        const { username } = req.currentUser
        const user = await getUserByName(username)
        return NextResponse.json(formatUserInfo(user))
    })
    .post(async (req: DBRequest) => {
        const { username, password } = await req.json()
        const newUser = (await addUser(username, password)).toObject()
        const accessToken = await generateJWT(newUser)
        const res = NextResponse.json(formatUserInfo(newUser))
        res.cookies.set('AccessToken', accessToken, { domain: HOSTNAME, path: '/' })
        return res
    })
    .patch(authMiddleware, async (req) => {
        const { config } = await req.json()
        const user = req.currentUser
        const editedConfig = _.pick(config, ['serpEnabled', 'temperature', 'activePlugins'])
        const editedUser = (await editConfig(user._id.toString(), editedConfig)).toObject()
        return NextResponse.json(formatUserInfo(editedUser))
    })

export const GET = router.run
export const POST = router.run
export const PATCH = router.run
