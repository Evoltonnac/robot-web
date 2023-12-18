import OpenAI from 'openai'

let openai: OpenAI | null = null

export function getOpenai(): OpenAI {
    if (openai) {
        return openai
    }
    return (openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    }))
}
