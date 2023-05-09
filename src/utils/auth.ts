import { clientCookies, SharedCookie } from '@/utils/shared'
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
 * @param nextCtx nextjs getServerSideProps context
 */
export const logOut = (nextCtx?: GetServerSidePropsContext) => {
    if (typeof window !== 'undefined') {
        clientCookies.remove('currentUser')
        Router.pathname.indexOf('/login') !== 0 && Router.replace('/login')
    } else if (nextCtx) {
        const { resolvedUrl, res } = nextCtx
        const pathname = new URL(resolvedUrl, 'https://robot-web.com').pathname
        pathname.indexOf('/login') !== 0 && res.writeHead(302, { Location: '/login' })
        res.end()
    }
}
