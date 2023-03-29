import Head from 'next/head'
import { useState } from 'react'
import ChatBot from '@/components/ChatBot'

export default function Home() {
    const [res, setRes] = useState('')
    
    return (
        <>
            <Head>
                <title>首页</title>
            </Head>
            <ChatBot></ChatBot>
        </>
    )
}
