import jsCookie from 'js-cookie'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// get current user token header
export const getAuthorizationHeader = (serverCookies?: ReadonlyRequestCookies) => {
    const AccessToken = serverCookies?.get('AccessToken')?.value || jsCookie.get('AccessToken')
    return {
        Authorization: `Bearer ${AccessToken || ''}`,
    }
}

/**
 * log out and redirect at client or server side
 * @param nextCtx nextjs getServerSideProps context
 */
export const logOut = () => {
    if (typeof window !== 'undefined') {
        jsCookie.remove('currentUser')
        location.pathname.indexOf('/login') === -1 && location.replace('/login')
    }
}
