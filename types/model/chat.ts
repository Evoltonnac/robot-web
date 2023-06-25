import { Types } from 'mongoose'
import { Preset } from './preset'

export interface Chat {
    messages: Message[]
    preset: Types.ObjectId
    user: Types.ObjectId
}

export interface ChatWithConfig {
    messages: Message[]
    preset?: Preset
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
