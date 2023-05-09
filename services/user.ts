import User from '@/models/user'
import { User as UserType } from '@/types/model/user'
import { Types } from 'mongoose'
import _ from 'lodash'

async function getUserByName(username: string) {
    try {
        if (!username) {
            throw new Error('username is null')
        }
        const user = await User.find({
            username,
        })
        if (!user.length) {
            throw new Error('no user found')
        }
        return user && user[0]
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

// add new user and return the new user object
async function addUser(username: string, password: string) {
    const isExist = await User.exists({
        username: username,
    })
    if (isExist) {
        throw new Error('user existed')
    }
    const newUser = new User({
        username,
        password,
    })
    newUser.save()
    return newUser
}

// filter out sensitive info in userinfo
function formatUserInfo(
    user: UserType & {
        _id: Types.ObjectId
    }
) {
    return _.omit(user, ['password', '_id'])
}

export { getUserByName, addUser, formatUserInfo }
