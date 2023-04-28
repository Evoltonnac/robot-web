import cookie from 'js-cookie'
import type { NextApiResponse } from 'next'
import Router from 'next/router'

// get current user token header
export const getAuthorizationHeader = () => {
    if (typeof window !== 'undefined') {
        const currentUser = cookie.get('currentUser')
        return {
            Authorization: `Bearer ${JSON.parse(currentUser || '{}')?.accessToken || ''}`,
        }
    }
    return
}

/**
 * log out and redirect at client or server side
 * @param serverRes next response object at server side
 */
export const logOut = (serverRes?: NextApiResponse) => {
    if (typeof window !== 'undefined') {
        cookie.remove('currentUser')
        Router.replace('/login')
    } else if (serverRes) {
        serverRes.redirect('/login')
    }
}
