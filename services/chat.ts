import Chat from '@/models/chat'
import { Message } from '@/types/model/chat'

async function getChatById(chatId: string) {
    try {
        const chat = await Chat.findById(chatId)
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

async function clearChatById(chatId: string) {
    try {
        const chat = await Chat.findById(chatId)
        if (!chat) {
            return
        }

        chat.messages = []
        await chat.save()
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to retrieve chat by ID')
    }
}

async function pushMessages(chatId: string, messages: Message[]) {
    try {
        const chat = await getChatById(chatId)
        if (!chat) {
            return
        }

        chat.messages.push(...messages)
        await chat.save()
        return chat
    } catch (error) {
        console.error(error)
        throw new Error('Failed to push message to chat')
    }
}

export { getChatById, clearChatById, pushMessages }
