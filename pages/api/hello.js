import nc from 'next-connect'
import { Configuration, OpenAIApi } from 'openai'
import { SocksProxyAgent } from 'socks-proxy-agent'
const proxyAgent = new SocksProxyAgent('socks5://127.0.0.1:1088')

export default nc().get(async (req, res) => {
    console.info(process.env.OPENAI_API_KEY)
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-0301',
        'messages': [{'role': 'user', 'content': 'Say this is a test!'}],
        'temperature': 0.7
    }, {
        httpAgent: proxyAgent,
        httpsAgent: proxyAgent,
    })
    const data = response.data.choices[0].message.content
    res.status(200).json({data})
})
