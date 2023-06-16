import { ChatList, useChatList } from '@/components/chat/ChatList'
import { PresetList, usePresetList } from '@/components/preset/PresetList'
import { commonRequest } from '@/src/utils/request'
import { ChatListItem } from '@/types/view/chat'
import { PresetListItem } from '@/types/view/preset'
import { Box, Container } from '@mui/material'
import Head from 'next/head'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { makeStyles } from 'tss-react/mui'

type ChatListResponse = {
    chatList: ChatListItem[]
}
type PresetListResponse = {
    presetList: PresetListItem[]
}
type ChatListPageProps = ChatListResponse & PresetListResponse

export const getServerSideProps: GetServerSideProps<ChatListPageProps> = async (ctx) => {
    try {
        const [data1, data2] = await Promise.all([
            commonRequest(ctx).get<ChatListResponse>('/api/chat'),
            commonRequest(ctx).get<PresetListResponse>('/api/preset'),
        ])
        return {
            props: {
                chatList: data1.chatList || [],
                presetList: data2.presetList || [],
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

const useStyles = makeStyles()((theme) => ({
    pageContainer: {
        paddingTop: theme.spacing(3),
    },
    presetContainer: {
        marginTop: theme.spacing(2),
    },
}))

const Chat: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ chatList, presetList }) => {
    const { list: cList, actions: cActions } = useChatList(chatList)
    const { list: pList, actions: pActions } = usePresetList(presetList)

    const { classes } = useStyles()
    return (
        <>
            <Head>
                <title>所有对话</title>
            </Head>
            <Container className={classes.pageContainer}>
                <ChatList list={cList} actions={cActions}></ChatList>
                <Box className={classes.presetContainer}>
                    <PresetList list={pList} actions={pActions}></PresetList>
                </Box>
            </Container>
        </>
    )
}

export default Chat
