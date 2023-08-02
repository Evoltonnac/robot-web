import Head from 'next/head'
import ChatBot from '@/components/chat/ChatBox'
import { useRouter } from 'next/router'
import { Container } from '@mui/material'

export default function ChatById() {
    const { query } = useRouter()

    return (
        <>
            <Head>
                <title>Robot ♂ Chat</title>
            </Head>
            <Container sx={{ height: '100vh', padding: 0 }}>
                {query.chatid ? <ChatBot chatid={query.chatid.toString()}></ChatBot> : null}
            </Container>
        </>
    )
}
