import Chat from '@/models/chat'
import { Message } from '@/types/model/chat'
import _ from 'lodash'
import { Types } from 'mongoose'

async function getChatById(userId: Types.ObjectId, chatId: string) {
    try {
        const chat = await Chat.findById(chatId)
        if (!chat || !chat.user.equals(userId)) {
            throw new Error('no auth')
        }
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

// add new chat and return the new chat object
async function addChat(userId: Types.ObjectId) {
    const newChat = new Chat({
        user: userId,
        messages: [],
    })
    newChat.save()
    return newChat
}

// add new chat and return the new chat object
async function deleteChatById(userId: Types.ObjectId, chatId: string) {
    try {
        await Chat.findOneAndDelete({ user: userId, _id: chatId })
        return
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

async function clearChatById(userId: Types.ObjectId, chatId: string) {
    try {
        const chat = await getChatById(userId, chatId)
        chat.messages = []
        await chat.save()
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

async function pushMessages(userId: Types.ObjectId, chatId: string, messages: Message[]) {
    try {
        const chat = await getChatById(userId, chatId)
        chat.messages.push(...messages)
        await chat.save()
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to push message to chat')
    }
}

async function updataMessage(userId: Types.ObjectId, chatId: string, messageId: string, message: Message) {
    try {
        await Chat.updateOne(
            {
                user: userId,
                _id: chatId,
            },
            {
                $set: { 'messages.$[message]': message },
            },
            {
                arrayFilters: [
                    {
                        'message._id': messageId,
                    },
                ],
            }
        )
        return
    } catch (error) {
        console.error(error)
        throw new Error('Failed to update message to chat')
    }
}

async function getChatList(userId: Types.ObjectId) {
    try {
        const chats = await Chat.aggregate([
            {
                $match: {
                    user: userId,
                },
            },
            {
                $addFields: {
                    messagesInfo: {
                        total: { $size: '$messages' },
                        first: { $ifNull: [{ $arrayElemAt: ['$messages.content', 0] }, ''] },
                    },
                },
            },
            {
                $project: {
                    messages: 0,
                },
            },
        ])
        return chats
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chats')
    }
}

export { getChatById, addChat, deleteChatById, clearChatById, pushMessages, updataMessage, getChatList }
