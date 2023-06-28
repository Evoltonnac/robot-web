import { Configuration, OpenAIApi } from 'openai-edge'

let openai: OpenAIApi | null = null

export function getOpenai(): OpenAIApi {
    if (openai) {
        return openai
    }
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    openai = new OpenAIApi(configuration)
    return openai
}
