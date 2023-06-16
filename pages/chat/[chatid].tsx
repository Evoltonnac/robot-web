import Head from 'next/head'
import ChatBot from '@/components/chat/ChatBox'
import { useRouter } from 'next/router'

export default function ChatById() {
    const { query } = useRouter()

    return (
        <>
            <Head>
                <title>Robot ♂ Chat</title>
            </Head>
            {query.chatid ? <ChatBot chatid={query.chatid.toString()}></ChatBot> : null}
        </>
    )
}
