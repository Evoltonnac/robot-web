import { createChatCompletionWithProxy } from '@/utils/openai'
import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'
const router = createRouter<NextApiRequest, NextApiResponse>()

export default router.post(async (req, res) => {
    const response = await createChatCompletionWithProxy({
        model: 'gpt-3.5-turbo-0301',
        messages: [{ role: 'user', content: req.body?.content }],
        temperature: 0.7,
    })
    const data = response.data.choices[0]?.message?.content
    res.status(200).json({ data })
})
