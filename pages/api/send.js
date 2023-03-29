import nc from 'next-connect'
import { Configuration, OpenAIApi } from 'openai'
import { SocksProxyAgent } from 'socks-proxy-agent'
const proxyAgent = process.env.PROXY && new SocksProxyAgent(process.env.PROXY)

export default nc().post(async (req, res) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    const openai = new OpenAIApi(configuration)
    const axiosOptions = {}
    proxyAgent && Object.assign(axiosOptions, {
        httpAgent: proxyAgent,
        httpsAgent: proxyAgent,
    })
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-0301',
        messages: [{role: 'user', content: req.body.content}],
        temperature: 0.7
    }, axiosOptions)
    const data = response.data.choices[0].message.content
    res.status(200).json({data})
})
