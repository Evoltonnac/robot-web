import { NextHandler } from 'next-connect'
import { User as UserType } from '@/types/model/user'
import { Types } from 'mongoose'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { DBRequest } from './db'
import Boom from '@hapi/boom'
import { ENCODER } from '@/utils/shared'

const { JWT_SECRET = '' } = process.env
const JWT_VERSION = '1'
const secret = ENCODER.encode(JWT_SECRET)

interface JWTPayloadType extends JWTPayload {
    version: string
    _id: string
    username: string
}

export interface AuthRequest extends DBRequest {
    currentUser: {
        _id: string
        username: string
    }
}

// check user authorization
export async function authMiddleware(req: AuthRequest, ctx: unknown, next: NextHandler) {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/, '') || ''
    try {
        const { _id, username } = (await jwtVerify(token, secret)).payload as JWTPayloadType
        // check if user exists
        req.currentUser = { _id, username }
    } catch (err) {
        throw Boom.unauthorized('用户未登录')
    }
    return await next()
}

// generateJWT from user
export async function generateJWT(
    user: UserType & {
        _id: Types.ObjectId
    }
) {
    return new SignJWT({
        version: JWT_VERSION,
        _id: user._id,
        username: user.username,
    })
        .setExpirationTime('3d')
        .sign(secret)
}
