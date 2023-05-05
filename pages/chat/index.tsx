import { commonRequest } from '@/src/utils/request'
import { Chat } from '@/types/model/chat'
import { Container } from '@mui/material'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'

type ChatListPageProps = {
    chatList?: Chat[]
}

export const getServerSideProps: GetServerSideProps<ChatListPageProps> = async (ctx) => {
    const data = (await commonRequest(ctx).get('/api/chat')) as Chat[]
    return {
        props: {
            chatList: data,
        },
    }
}

const Chat: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
    return <Container></Container>
}

export default Chat
