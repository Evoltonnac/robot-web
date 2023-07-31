import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { DBRequest, dbMiddleware } from '@/services/middlewares/db'
import { AuthRequest, authMiddleware, generateJWT } from '@/services/middlewares/auth'
import { addUser, editConfig, formatUserInfo } from '@/services/user'
import { setCookie } from '@/utils/common'
import { HOSTNAME } from '@/utils/constant'
import _ from 'lodash'

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
    .patch(authMiddleware, async (req, res) => {
        const { config } = req.body
        const user = req.currentUser
        const editedConfig = _.pick(config, ['serpEnabled'])
        const editedUser = (await editConfig(user._id.toString(), editedConfig)).toObject()
        res.status(200).json(formatUserInfo(editedUser))
        res.end()
    })

export default router.handler()
