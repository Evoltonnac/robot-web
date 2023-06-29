import AWS from 'aws-sdk'

let s3: AWS.S3 | null = null

const bucket = process.env.AWS_BUCKET_NAME || ''

export function getS3(): AWS.S3 {
    if (s3) {
        return s3
    }
    s3 = new AWS.S3({
        region: 'ap-southeast-1',
        credentials: new AWS.Credentials({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        }),
        signatureVersion: 'v4',
    })
    return s3
}

export function uploadFile(filedata: AWS.S3.Body, filename: string, directory: string, mineType?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        getS3().upload(
            {
                Body: filedata,
                Key: `${directory}/${filename}`,
                Bucket: bucket,
                ...(mineType && { ContentType: mineType }),
            },
            (err, data) => {
                if (err) {
                    console.error(err)
                    reject(err)
                }
                if (data) {
                    resolve(data.Location)
                }
            }
        )
    })
}

export async function uploadImgFromUrl(url: string, directory: string): Promise<string> {
    console.log(url)
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
