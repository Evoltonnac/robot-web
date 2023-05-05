import Chat from '@/models/chat'
import { Message } from '@/types/model/chat'
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

async function getChatList(userId: Types.ObjectId) {
    try {
        const chats = await Chat.find(
            {
                user: userId,
            },
            {
                _id: 1,
                user: 0,
                messages: { $slice: 1 },
            }
        )
        return chats
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chats')
    }
}

export { getChatById, addChat, deleteChatById, clearChatById, pushMessages, getChatList }
