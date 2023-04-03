import mongoose from 'mongoose'
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: String,
    password: String,
})

export default mongoose.model('User') || mongoose.model('User', UserSchema)
