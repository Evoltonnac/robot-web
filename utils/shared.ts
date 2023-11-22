export const ENCODER = new TextEncoder()
export const DECODER = new TextDecoder()

export async function generateHash(str: string, algorithm: AlgorithmIdentifier = 'SHA-256') {
    const hashBytes = await crypto.subtle.digest(algorithm, ENCODER.encode(str))
    return Array.prototype.map.call(new Uint8Array(hashBytes), (x) => ('00' + x.toString(16)).slice(-2)).join('')
}

// build url with parameters
type UrlParameters = Record<string, string | number | boolean | undefined | null>

export function buildUrl<P extends UrlParameters>(parameters: P, baseUrl: string): string {
    const nonUndefinedParams: [string, string][] = Object.entries(parameters)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, `${value}`])
    const searchParams = new URLSearchParams(nonUndefinedParams)
    return `${baseUrl}${baseUrl.endsWith('?') ? '&' : '?'}${searchParams}`
}

// 返回类型为keys中所有string作为key的Record
export function getAllParams(searchParams: URLSearchParams, keys: string[]): Record<string, string> {
    return keys.reduce((pre, cur) => {
        const value = searchParams.get(cur)
        return {
            ...pre,
            [cur]: value || '',
        }
    }, {})
}
