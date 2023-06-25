import * as ChatModel from '../model/chat'
import { Preset } from '../model/preset'
import { withId } from './common'

export type Chat = withId<Omit<ChatModel.Chat, 'preset'>> & {
    messages: Message[]
    preset?: Preset
}

export type ChatListItem = Chat & {
    messagesInfo: {
        total: number
        first: string
    }
    preset?: Preset
}

export type Message = withId<ChatModel.Message>
