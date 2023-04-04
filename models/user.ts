import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: String,
    password: String,
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
