export interface Chat {
    messages: Message[]
}

export interface Message {
    type: MessageType
    content: string
    role: 'system' | 'user' | 'assistant'
}

export const enum MessageType {
    TEXT = 1,
}
