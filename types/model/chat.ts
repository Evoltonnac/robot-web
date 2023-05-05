import { Types } from 'mongoose'

export interface Chat {
    messages: Message[]
    user: Types.ObjectId
}

export interface Message {
    type: MessageType
    content: string
    role: 'system' | 'user' | 'assistant'
}

export const enum MessageType {
    TEXT = 1,
}
