import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { getAuthorizationHeader, logOut } from './auth'
import type { NextApiResponse } from 'next'
import { SendNotification } from '@/src/hooks/useNotification'

interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
    serverRes?: NextApiResponse // res object at serverside in nextjs
}

// add header
const addTokenInterceptor = (config: InternalAxiosRequestConfig) => {
    const authorizationHeader = getAuthorizationHeader()
    config.headers.concat(authorizationHeader)
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
            const { serverRes } = error.request.config as EnhancedAxiosRequestConfig
            logOut(serverRes)
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
const sharedRequest = () => {
    // axios instance for making requests
    const axiosInstance = axios.create({
        timeout: 6000,
        params: {},
    })

    axiosInstance.interceptors.request.use(addTokenInterceptor)
    return axiosInstance
}

// axios instance at server side
export const serverRequest = (serverRes?: NextApiResponse) => {
    const axiosInstance = sharedRequest()
    // add custom ctx to axios request config
    serverRes &&
        axiosInstance.interceptors.request.use((config: EnhancedAxiosRequestConfig) => {
            config.serverRes = serverRes
            return config
        })
    axiosInstance.interceptors.response.use(resHandleInterceptor, errorHandleInterceptor())
    return axiosInstance
}

// axios instance at client side
export const clientRequest = sharedRequest()
