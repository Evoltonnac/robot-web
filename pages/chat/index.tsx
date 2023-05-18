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
    try {
        const data = await commonRequest(ctx).get<ChatListPageProps>('/api/chat')
        return {
            props: {
                chatList: data.chatList || [],
            },
        }
    } catch (error: any) {
        if (error?.response?.status === 401) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            }
        } else {
            throw error
        }
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
