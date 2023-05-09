import { User as UserType } from '@/types/model/user'
import mongoose, { Model } from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: String,
    password: String,
})

const User: Model<UserType> = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
