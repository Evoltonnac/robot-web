import { Types } from 'mongoose'

export interface Preset {
    user: Types.ObjectId
    title: string
    prompt: string
    avatar: string
}
