import { clientRequest } from './request'

// upload file from url or file object
export const upload = (file: string | File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return clientRequest
        .post<{ url: string }>('api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(({ url }) => {
            if (url) {
                return url
            } else {
                throw new Error('上传失败')
            }
        })
}
