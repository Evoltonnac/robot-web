import { request } from './request'

// upload file from url or file object
export const upload = (file: string | File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ url: string }>('api/upload', {
        method: 'POST',
        body: formData,
    }).then(({ data }) => {
        if (data.url) {
            return data.url
        } else {
            throw new Error('上传失败')
        }
    })
}
