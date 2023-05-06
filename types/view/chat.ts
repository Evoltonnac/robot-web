import * as ChatModal from '../model/chat'
import { withId } from './common'

export type Chat = withId<ChatModal.Chat> & {
    messages: Message[]
}

export type Message = withId<ChatModal.Message>
