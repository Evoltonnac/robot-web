import * as ChatModel from '../model/chat'
import { Preset } from '../model/preset'
import { withId } from './common'

export type Chat = withId<ChatModel.Chat> & {
    messages: Message[]
}

export type ChatListItem = Chat & {
    messagesInfo: {
        total: number
        first: string
    }
    presetInfo: Pick<Preset, 'title' | 'avatar'>
}

export type Message = withId<ChatModel.Message>
