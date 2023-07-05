import { NextRequest } from 'next/server'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { getOpenai } from '@/utils/openai'

export const config = {
    runtime: 'edge',
}

export default async function handler(req: NextRequest) {
    const response = await getOpenai().createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: '写一篇文章' }],
        max_tokens: 200,
        temperature: 0,
        stream: true,
    })
    const stream = OpenAIStream(response, {
        async onCompletion(text) {
            console.log(text)
        },
    })
    return new StreamingTextResponse(stream)
}
