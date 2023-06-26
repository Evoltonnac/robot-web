import User from '@/models/user'
import { User as UserType } from '@/types/model/user'
import { Types } from 'mongoose'
import _ from 'lodash'
import Boom from '@hapi/boom'
import { ErrorData } from '@/types/server/common'
import { tryOrBoom } from './middlewares/customRouter'

const getUserByName = tryOrBoom(
    async (username: string) => {
        const user = await User.findOne({
            username,
        })
        if (!user) {
            throw Boom.notFound<ErrorData>('', {
                errno: 'A0201',
                errmsg: '用户不存在',
            })
        }
        return user
    },
    {
        errno: 'B0201',
        errmsg: '获取用户信息失败',
    }
)

// add new user and return the new user object
const addUser = tryOrBoom(
    async (username: string, password: string) => {
        const isExist = await User.exists({
            username: username,
        })
        if (isExist) {
            throw Boom.notFound<ErrorData>('', {
                errno: 'A0101',
                errmsg: '用户已存在',
            })
        }
        const newUser = new User({
            username,
            password,
        })
        newUser.save()
        return newUser
    },
    {
        errno: 'B0101',
        errmsg: '注册用户失败',
    }
)

// filter out sensitive info in userinfo
function formatUserInfo(
    user: UserType & {
        _id: Types.ObjectId
    }
) {
    return _.omit(user, ['password', '_id'])
}

export { getUserByName, addUser, formatUserInfo }
