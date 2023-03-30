export interface Message {
    type: MessageType
    content: string
    isSelf: 0 | 1
}

export const enum MessageType {
    TEXT = 1,
}
