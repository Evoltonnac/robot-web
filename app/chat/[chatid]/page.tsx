import Head from 'next/head'
import ChatBot from '@/components/chat/ChatBot'
import { Container } from '@mui/material'
import { useSearchParams } from 'next/navigation'

export default function ChatById() {
    const searchParams = useSearchParams()
    const chatid = searchParams.get('chatid')

    return (
        <>
            <Head>
                <title>Robot ♂ Chat</title>
            </Head>
            <Container sx={{ height: '100vh', padding: 0 }}>{chatid ? <ChatBot chatid={chatid}></ChatBot> : null}</Container>
        </>
    )
}
