export interface Message {
    type: MessageType;
    content: String;
    isSelf: 0 | 1;
}

export const enum MessageType {
    TEXT= 1
}