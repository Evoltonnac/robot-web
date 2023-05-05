import { clientCookies, SharedCookie } from '@/utils/shared'
import { ServerResponse } from 'http'
import { GetServerSidePropsContext } from 'next'
import Router from 'next/router'
// get current user token header
export const getAuthorizationHeader = (req?: GetServerSidePropsContext['req']) => {
    const AccessToken = new SharedCookie(req).get('AccessToken')
    return {
        Authorization: `Bearer ${AccessToken || ''}`,
    }
}

/**
 * log out and redirect at client or server side
 * @param res server response at server side
 */
export const logOut = (res?: ServerResponse) => {
    if (typeof window !== 'undefined') {
        clientCookies.remove('currentUser')
        Router.replace('/login')
    } else if (res) {
        res.writeHead(302, { Location: '/login' })
        res.end()
    }
}
