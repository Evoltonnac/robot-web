import { S3Client, PutObjectCommand, PutObjectCommandInputType } from '@aws-sdk/client-s3'

let s3: S3Client | null = null

const bucket = process.env.AWS_BUCKET_NAME || ''
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''

export function getS3(): S3Client {
    if (s3) {
        return s3
    }
    s3 = new S3Client({
        region: 'ap-southeast-1',
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    })
    return s3
}

export function uploadFile(
    filedata: PutObjectCommandInputType['Body'],
    filename: string,
    directory: string,
    mineType?: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: `${directory}/${filename}`,
        Body: filedata,
        ...(mineType && { ContentType: mineType }),
        CacheControl: 'max-age=31536000',
    })
    return getS3()
        .send(command)
        .then(
            () => {
                return Promise.resolve(`https://${bucket}/${directory}/${filename}`)
            },
            (error) => {
                console.error(error)
                return Promise.reject(error)
            }
        )
}

export async function uploadImgFromUrl(url: string, directory: string): Promise<string> {
    const filenameMatch = new URL(url).pathname.match(
        /[^\/]+\.(bmp|jpg|png|tif|gif|pcx|tga|exif|fpx|svg|psd|cdr|pcd|dxf|ufo|eps|ai|raw|WMF|webp|jpeg)/
    )
    const filename = filenameMatch ? filenameMatch[0] : ''
    if (!filename) {
        return Promise.reject('Could not determine filename')
    }
    try {
        const file = await fetch(url)
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        return uploadFile(fileBuffer, filename, directory)
    } catch (e) {
        return Promise.reject('Could not fetch file')
    }
}
