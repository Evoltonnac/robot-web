import Head from 'next/head'
import dynamic from 'next/dynamic'
const ChatCom = dynamic(
    () => import('@/components/ChatCom'),
    { ssr: false }
)

export default function Home() {
    
    return (
        <>
            <Head>
                <title>首页</title>
            </Head>
            {/* <ChatCom></ChatCom> */}
            
        </>
    )
}
