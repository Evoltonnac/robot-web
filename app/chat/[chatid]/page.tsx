import Head from 'next/head'
import ChatBot from '@/components/chat/ChatBot'
import { Container } from '@mui/material'

export default function ChatById({ params }: { params: { chatid: string } }) {
    return (
        <>
            <Head>
                <title>Robot ♂ Chat</title>
            </Head>
            <Container sx={{ height: '100vh', padding: 0 }}>
                {params.chatid ? <ChatBot chatid={params.chatid} isFullScreen></ChatBot> : null}
            </Container>
        </>
    )
}
