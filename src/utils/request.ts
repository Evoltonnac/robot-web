import { getAuthorizationHeader, logOut } from './auth'
import { SendNotification } from '@/src/hooks/useNotification'
import { CommonResponse } from '@/types/server/common'
import { fetch } from 'cross-fetch'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const { DOMAIN = '' } = process.env
const BASE_URL = `${DOMAIN.indexOf(':') === -1 ? 'https://' : 'http://'}${DOMAIN}`

const modifyRequestInit = (init: RequestInitWithJSON, cookies?: ReadonlyRequestCookies): RequestInit => {
    const { data, headers, ...rest } = init
    const headersObj = new Headers(headers)
    const initModified = {
        headers: headersObj,
        ...rest,
    }
    // format json request
    if (!headersObj.get('Content-Type') && Object.prototype.toString.call(data) === '[object Object]') {
        initModified.body = JSON.stringify(data)
        headersObj.set('Content-Type', 'application/json')
    }
    // add auth header
    const { Authorization } = getAuthorizationHeader(cookies)
    headersObj.set('Authorization', Authorization)

    initModified.headers = headersObj
    return initModified
}

// default get json data
export async function resHandleInterceptor<T>(response: Response): Promise<CommonResponse<T> | Response> {
    const { headers, status } = response
    // json data handler
    if (headers.get('content-type')?.indexOf('application/json') !== -1) {
        const resData = await response.json()
        if (status === 200 && resData.data) {
            // resolve json body
            return Promise.resolve(resData)
        } else {
            // throw json error
            return Promise.reject(Object.assign(response, resData))
        }
    }
    return Promise.resolve(response)
}

/**
 * error handler
 * @param sendNotification send notification if at client side
 */
export const errorHandleInterceptor = (sendNotification?: SendNotification) => async (error: Response & CommonResponse<unknown>) => {
    if (error.status && error.errno) {
        const { errno, errmsg } = error
        // not logged
        if (error.status === 401) {
            logOut()
        }
        // other error message
        else if (+errno !== 0 && errmsg) {
            sendNotification ? sendNotification({ msg: errmsg, variant: 'error' }) : console.error(errmsg)
        } else {
            console.error(error)
        }
    } else {
        console.error(error)
    }
    return Promise.reject(error)
}

// override response when T is Recard type
interface RequestFunc {
    (input: string, init?: RequestInitWithJSON | undefined): Promise<Response | CommonResponse<unknown>>
    <T>(input: string, init?: RequestInitWithJSON | undefined): Promise<CommonResponse<T>>
}

interface RequestInitWithJSON extends RequestInit {
    data?: Record<string, unknown>
}

export const createRequest = (options?: { cookies?: ReadonlyRequestCookies; sendNotification?: SendNotification }) => {
    const { cookies, sendNotification } = options || {}
    const requestFunc = (<T>(input: string, init?: RequestInitWithJSON | undefined): Promise<Response | CommonResponse<T>> => {
        const isServer = typeof window === 'undefined'
        let url = input
        if (isServer && input.startsWith('/')) {
            url = BASE_URL + input
        }

        return fetch(url, modifyRequestInit(init || {}, cookies))
            .then(resHandleInterceptor<T>)
            .catch(errorHandleInterceptor(sendNotification))
    }) as RequestFunc
    return requestFunc
}
export const request = createRequest()
