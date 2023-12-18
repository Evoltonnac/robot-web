import { NextRequest } from 'next/server'
import { getOpenai } from '@/utils/openai'
import { NextResponse, createCustomEdgeRouter } from '@/services/middlewares/edge'

const router = createCustomEdgeRouter<NextRequest, { params: unknown }>()

router.post(async (req) => {
    const prompt = (await req.json()).prompt
    if (!prompt) {
        throw new Error(JSON.stringify({ errno: 'A0601', errmsg: '缺少提示词', status: 400 }))
    }
    try {
        const response = await getOpenai().images.generate({
            model: 'dall-e-2',
            prompt: `icon for ${prompt}`,
            n: 1,
            size: '256x256',
        })
        const { data } = await response
        return NextResponse.json({
            url: data[0].url,
        })
    } catch (error) {
        console.error(error)
        throw new Error(JSON.stringify({ errno: 'C0601', errmsg: '生成失败' }))
    }
})

export const runtime = 'edge'

export const POST = router.run
