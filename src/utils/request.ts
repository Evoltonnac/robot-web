import axios, { AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios'
import { getAuthorizationHeader, logOut } from './auth'
import { SendNotification } from '@/src/hooks/useNotification'
import { GetServerSidePropsContext } from 'next'

const dev = process.env.NODE_ENV !== 'production'

interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
    nextCtx?: GetServerSidePropsContext // res object at serverside in nextjs
}

// add header
const addTokenInterceptor = (config: EnhancedAxiosRequestConfig) => {
    const { nextCtx } = config
    const authorizationHeader = getAuthorizationHeader(nextCtx?.req)
    Object.assign(config.headers, authorizationHeader)
    return config
}

// default get json data
export const resHandleInterceptor = (response: AxiosResponse) => {
    if (response.data) {
        return Promise.resolve(response.data.data)
    }
    return Promise.resolve(response.data)
}

/**
 * error handler
 * @param sendNotification send notification if at client side
 */
export const errorHandleInterceptor = (sendNotification?: SendNotification) => (error: any) => {
    if (error.response) {
        const { data: resData, status } = error.response
        const { errno, errmsg } = resData || {}
        // not logged
        if (status === 401) {
            const { nextCtx } = error.config as EnhancedAxiosRequestConfig
            logOut(nextCtx?.res)
        }
        // other error message
        if (errno && errmsg) {
            sendNotification ? sendNotification({ msg: errmsg, variant: 'error' }) : console.log(errmsg)
        }
    } else if (error.request) {
        console.log('timeout')
    } else {
        // handle other errors
    }
    return Promise.reject(error)
}

// shared axios instance both at client and server side
const sharedRequest = (options?: CreateAxiosDefaults) => {
    // axios instance for making requests
    const axiosInstance = axios.create({
        timeout: 6000,
        params: {},
        ...options,
    })

    axiosInstance.interceptors.request.use(addTokenInterceptor)
    return axiosInstance
}

// axios instance at server side
export const serverRequest = (nextCtx?: GetServerSidePropsContext) => {
    const axiosInstance = sharedRequest({
        baseURL: dev ? 'http://robot-web.com:3000' : 'https://robot-web-evoltonnac.vercel.app',
    })
    // add custom ctx to axios request config
    nextCtx &&
        axiosInstance.interceptors.request.use((config: EnhancedAxiosRequestConfig) => {
            config.nextCtx = nextCtx
            return config
        })
    axiosInstance.interceptors.response.use(resHandleInterceptor, errorHandleInterceptor())
    console.log(nextCtx)
    return axiosInstance
}

// axios instance at client side
export const clientRequest = sharedRequest()

// axios instance at both sides (e.g. getInitialProps)
export const commonRequest = (nextCtx?: GetServerSidePropsContext) => {
    // server side
    if (typeof window === 'undefined') {
        return serverRequest(nextCtx)
    }
    // client side
    else {
        return clientRequest
    }
}
