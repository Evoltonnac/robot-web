import ChatList from '@/components/ChatList'
import { commonRequest } from '@/src/utils/request'
import { Chat } from '@/types/view/chat'
import Head from 'next/head'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'

type ChatListPageProps = {
    chatList: Chat[]
}

export const getServerSideProps: GetServerSideProps<ChatListPageProps> = async (ctx) => {
    const data = (await commonRequest(ctx).get('/api/chat')) as Chat[]
    return {
        props: {
            chatList: data || [],
        },
    }
}

const Chat: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ chatList }) => {
    return (
        <>
            <Head>
                <title>登录</title>
            </Head>
            <ChatList chatList={chatList}></ChatList>
        </>
    )
}

export default Chat
