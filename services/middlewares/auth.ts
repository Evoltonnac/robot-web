import { NextApiResponse } from 'next'
import { NextHandler } from 'next-connect'
import { User as UserType } from '@/types/model/user'
import { Types } from 'mongoose'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getUserByName } from '../user'
import { DBRequest } from './db'

const { JWT_SECRET = '' } = process.env
const JWT_VERSION = '1'

interface JWTPayloadType extends JwtPayload {
    version: string
    _id: Types.ObjectId
    username: string
}

export interface AuthRequest extends DBRequest {
    currentUser: UserType & {
        _id: Types.ObjectId
    }
}

// check user authorization
export async function authMiddleware(req: AuthRequest, res: NextApiResponse, next: NextHandler) {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '')
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayloadType
        // check if user exists
        const user = await getUserByName(decoded?.username)
        req.currentUser = user.toObject()
        return next()
    } catch (err) {
        res.status(401).json({ errno: 1, errmsg: '用户未登录' })
        res.end()
        return
    }
}

// generateJWT from user
export function generateJWT(
    user: UserType & {
        _id: Types.ObjectId
    }
) {
    const token = jwt.sign(
        {
            version: JWT_VERSION,
            _id: user._id,
            username: user.username,
        },
        JWT_SECRET,
        {
            expiresIn: '3d',
        }
    )
    return token
}
