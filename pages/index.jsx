import Head from 'next/head'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useState } from 'react'

const ChatCom = dynamic(
    () => import('@/components/ChatCom'),
    { ssr: false }
)

export default function Home() {
    const [res, setRes] = useState('')
    const handleClick = () => {
        axios.get('/api/hello').then(res => {
            setRes(res.data.data)
        })
    }
    return (
        <>
            <Head>
                <title>首页</title>
            </Head>
            {/* <ChatCom></ChatCom> */}
            <button onClick={handleClick}>提问</button>
            <div>{res}</div>
        </>
    )
}
