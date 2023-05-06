import Head from 'next/head'
import Router from 'next/router'
import Login from '@/components/Login'
import { useUser } from '@/components/global/User'

export default function Home() {
    const { username } = useUser() || {}
    if (username) {
        Router.replace('/chat')
    }
    return (
        <>
            <Head>
                <title>登录</title>
            </Head>
            <Login></Login>
        </>
    )
}
