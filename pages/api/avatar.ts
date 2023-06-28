import { NextFetchEvent, NextRequest } from 'next/server'
import { getOpenai } from '@/utils/openai'
import { createEdgeRouter } from 'next-connect'
import { errorHandlerEdge } from '@/services/middlewares/edge'

export const config = {
    runtime: 'edge',
}

const router = createEdgeRouter<NextRequest, NextFetchEvent>()

router.post(async (req) => {
    const prompt = (await req.json()).prompt
    if (!prompt) {
        throw new Error(JSON.stringify({ errno: 'A0601', errmsg: '缺少提示词', status: 400 }))
    }
    try {
        const response = await getOpenai().createImage({
            prompt: `icon for ${prompt}`,
            n: 1,
            size: '256x256',
        })
        const { data } = await response.json()
        return new Response(
            JSON.stringify({
                errno: '00000',
                data: {
                    url: data[0].url,
                },
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'applicaiton/json',
                },
            }
        )
    } catch (error) {
        console.error(error)
        throw new Error(JSON.stringify({ errno: 'C0601', errmsg: '生成失败' }))
    }
})

export default router.handler({
    onError: errorHandlerEdge,
})
