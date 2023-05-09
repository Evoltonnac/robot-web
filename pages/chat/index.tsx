import { ChatList, useChatList } from '@/components/ChatList'
import { commonRequest } from '@/src/utils/request'
import { ChatListItem } from '@/types/view/chat'
import { Container } from '@mui/material'
import Head from 'next/head'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'

type ChatListPageProps = {
    chatList: ChatListItem[]
}

export const getServerSideProps: GetServerSideProps<ChatListPageProps> = async (ctx) => {
    const data = await commonRequest(ctx).get<ChatListItem[]>('/api/chat')
    return {
        props: {
            chatList: data || [],
        },
    }
}

const Chat: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ chatList }) => {
    const { list, actions } = useChatList(chatList)
    return (
        <>
            <Head>
                <title>所有对话</title>
            </Head>
            <Container>
                <ChatList list={list} actions={actions}></ChatList>
            </Container>
        </>
    )
}

export default Chat
