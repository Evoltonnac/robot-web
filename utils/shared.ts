export const ENCODER = new TextEncoder()
export const DECODER = new TextDecoder()

// shared cookie
import jsCookie from 'js-cookie'
import { getCookie } from 'cookies-next'
import { GetServerSidePropsContext } from 'next'
export const clientCookie = jsCookie
export class SharedCookie {
    private req?: GetServerSidePropsContext['req']
    private res?: GetServerSidePropsContext['res']
    constructor(req?: GetServerSidePropsContext['req'], res?: GetServerSidePropsContext['res']) {
        this.req = req
        this.res = res
    }
    get(key: string) {
        const { req, res } = this
        if (typeof window === 'undefined') {
            return getCookie(key, { req, res })
        } else {
            return jsCookie.get(key)
        }
    }
}
export const sharedCookie = new SharedCookie()

// build url with parameters
type UrlParameters = Record<string, string | number | boolean | undefined | null>

export function buildUrl<P extends UrlParameters>(parameters: P, baseUrl: string): string {
    const nonUndefinedParams: [string, string][] = Object.entries(parameters)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, `${value}`])
    const searchParams = new URLSearchParams(nonUndefinedParams)
    return `${baseUrl}?${searchParams}`
}
