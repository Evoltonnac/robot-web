import * as ChatModel from '../model/chat'
import { withId } from './common'

export type Chat = withId<ChatModel.Chat> & {
    messages: Message[]
}

export type ChatListItem = Chat & {
    messagesInfo: {
        total: number
        first: string
    }
}

export type Message = withId<ChatModel.Message>
