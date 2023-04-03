import mongoose from 'mongoose'
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    type: {
        type: String,
    },
    content: {
        type: String,
    },
    role: {
        type: String,
        enum: ['system', 'user', 'assistant'],
        required: true,
    },
})

const ChatSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: {
        type: [MessageSchema],
        required: true,
    },
})

export default mongoose.model('Chat') || mongoose.model('Chat', ChatSchema)
