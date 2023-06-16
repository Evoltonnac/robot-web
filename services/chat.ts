import Chat from '@/models/chat'
import { Message } from '@/types/model/chat'
import { ErrorData } from '@/types/server/common'
import Boom from '@hapi/boom'
import { Types } from 'mongoose'
import { tryOrBoom } from './middlewares/customRouter'
import { ChatListItem } from '@/types/view/chat'

const getChatById = tryOrBoom(
    async (userId: Types.ObjectId, chatId: string) => {
        const chat = await Chat.findById(chatId)
        if (!chat) {
            throw Boom.notFound<ErrorData>('', {
                errno: 'A0402',
                errmsg: '聊天不存在',
            })
        }
        if (!chat.user.equals(userId)) {
            throw Boom.forbidden<ErrorData>('', {
                errno: 'A0403',
                errmsg: '当前用户无权限',
            })
        }
        return chat
    },
    {
        errno: 'B0401',
        errmsg: '获取聊天信息失败',
    }
)

// add new chat and return the new chat object
const addChat = tryOrBoom(
    async (userId: Types.ObjectId) => {
        const newChat = new Chat({
            user: userId,
            messages: [],
        })
        newChat.save()
        return newChat
    },
    {
        errno: 'B0302',
        errmsg: '新增聊天失败',
    }
)

// delete chat
const deleteChatById = tryOrBoom(
    async (userId: Types.ObjectId, chatId: string) => {
        await Chat.findOneAndDelete({ user: userId, _id: chatId })
        return
    },
    {
        errno: 'B0303',
        errmsg: '删除聊天失败',
    }
)

// clear all messages of a chat
const clearChatById = tryOrBoom(
    async (userId: Types.ObjectId, chatId: string) => {
        await Chat.updateOne(
            {
                user: userId,
                _id: chatId,
            },
            {
                $set: { messages: [] },
            }
        )
        return
    },
    {
        errno: 'B0402',
        errmsg: '清空聊天记录失败',
    }
)

// push messages to a chat
const pushMessages = tryOrBoom(
    async (userId: Types.ObjectId, chatId: string, messages: Message[]) => {
        const chat = await getChatById(userId, chatId)
        chat.messages.push(...messages)
        await chat.save()
        return chat
    },
    {
        errno: 'B0403',
        errmsg: '发送消息失败',
    }
)

// updata a message to a chat
const updataMessage = tryOrBoom(
    async (userId: Types.ObjectId, chatId: string, messageId: string, message: Message) => {
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
    },
    {
        errno: 'B0404',
        errmsg: '更新消息失败',
    }
)

// get chat list of a user
const getChatList = tryOrBoom(
    async (userId: Types.ObjectId) => {
        const chats = await Chat.aggregate<ChatListItem>([
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
    },
    {
        errno: 'B0301',
        errmsg: '获取聊天列表失败',
    }
)

export { getChatById, addChat, deleteChatById, clearChatById, pushMessages, updataMessage, getChatList }
