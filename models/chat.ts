import mongoose, { Model } from 'mongoose'
import { Chat as ChatType } from '@/types/model/chat'
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    type: {
        type: Number,
        enum: [1],
        required: true,
    },
    content: {
        type: String,
        required: true,
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

const Chat: Model<ChatType> = mongoose.models.Chat || mongoose.model('Chat', ChatSchema)

export default Chat
