import { Configuration, OpenAIApi } from 'openai'
import { SocksProxyAgent } from 'socks-proxy-agent'
import {} from 'axios'

const proxyAgent = process.env.PROXY && new SocksProxyAgent(process.env.PROXY)
let openai: OpenAIApi | null = null

function getOpenai(): OpenAIApi {
    if (openai) {
        return openai
    }
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    openai = new OpenAIApi(configuration)
    return openai
}

type createChatCompletionParams = Parameters<OpenAIApi['createChatCompletion']>
async function createChatCompletionWithProxy(req: createChatCompletionParams[0], options?: createChatCompletionParams[1]) {
    return getOpenai().createChatCompletion(req, {
        ...(proxyAgent && {
            httpAgent: proxyAgent,
            httpsAgent: proxyAgent,
        }),
        ...options,
    })
}

export { getOpenai, createChatCompletionWithProxy }
