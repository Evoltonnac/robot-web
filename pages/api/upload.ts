import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import formidable from 'formidable'
import { uploadFile, uploadImgFromUrl } from '@/utils/upload'
import { Stream } from 'stream'
import Boom from '@hapi/boom'
import crypto from 'crypto'
import { ErrorData } from '@/types/server/common'

export const config = {
    api: {
        bodyParser: false,
    },
}

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router.use(authMiddleware).post(async (req, res) => {
    const { _id } = req.currentUser
    const form = formidable({})
    let hasFile = false
    let url = ''
    form.onPart = async (part) => {
        // customize handle file or nonfile
        if (part.name !== 'file') {
            return
        }
        hasFile = true
        // if file, upload to s3 with stream
        if (part.originalFilename || part.mimetype) {
            const stream = new Stream.PassThrough()
            const fileUrl = await uploadFile(
                stream,
                crypto
                    .createHash('sha256')
                    .update(`${_id}-${part.originalFilename || part.name || ''}-${Date.now()}`)
                    .digest('hex'),
                'ai-avatar',
                part.mimetype || undefined
            )
            part.pipe(stream)
            url = fileUrl
        }
        // if nonfile, handle by formidable
        else {
            form._handlePart(part)
        }
    }
    await new Promise<void>((resolve, reject) => {
        form.parse(req, async (err, fields) => {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            // if file url, upload from url to s3
            if (fields.file && /^(http|https):\/\//.test(fields.file.toString())) {
                const fileUrl = await uploadImgFromUrl(fields.file.toString(), 'ai-avatar')
                url = fileUrl
            }
            resolve()
        })
    })
    if (url) {
        res.status(200).json({ url })
        res.end()
    } else if (!hasFile) {
        throw Boom.badRequest<ErrorData>('file field not exist', {
            errno: 'A9901',
            errmsg: '文件不存在',
        })
    } else {
        throw Boom.internal<ErrorData>('upload failed', {
            errno: 'C9901',
            errmsg: '上传失败',
        })
    }
})

export default router.handler()
