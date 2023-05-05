export const ENCODER = new TextEncoder()
export const DECODER = new TextDecoder()

// shared cookie
import jsCookie from 'js-cookie'
import { getCookie } from 'cookies-next'
import { GetServerSidePropsContext } from 'next'
export const clientCookies = jsCookie
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
