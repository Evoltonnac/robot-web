import { createCustomRouter } from '@/services/middlewares/customRouter'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import { uploadFile, uploadImgFromUrl } from '@/utils/upload'
import { NextResponse } from '@/services/middlewares/edge'
import { generateHash } from '@/utils/shared'

const router = createCustomRouter<AuthRequest, { params: unknown }>()

router.use(authMiddleware).post(async (req, ctx) => {
    const { _id } = req.currentUser
    const form = await req.formData()
    const file = form.get('file') as Blob | string | null
    // no file uplaod
    if (!file) {
        throw new Error(JSON.stringify({ errno: 'A9901', errmsg: '文件不存在', status: 400 }))
    }
    try {
        // store image from url
        if (typeof file === 'string') {
            const newUrl = await uploadImgFromUrl(file, 'ai-avatar')
            return NextResponse.json({ url: newUrl })
        }
        // store image from upload file
        const buffer = Buffer.from(await file.arrayBuffer())
        // generate hash name
        const hashName = await generateHash(`${_id}-${file.name || ''}-${Date.now()}`)
        const uploadUrl = await uploadFile(buffer, hashName, 'ai-avatar')
        return NextResponse.json({ url: uploadUrl })
    } catch (e) {
        throw new Error(JSON.stringify({ errno: 'C9901', errmsg: '上传失败', status: 500 }))
    }
})

export const runtime = 'edge'

export const POST = router.run
