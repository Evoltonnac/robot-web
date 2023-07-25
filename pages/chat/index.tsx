import { ChatList, useChatList } from '@/components/chat/ChatList'
import { PresetList, usePresetList } from '@/components/preset/PresetList'
import { commonRequest } from '@/src/utils/request'
import { ChatListItem } from '@/types/view/chat'
import { Preset } from '@/types/view/preset'
import { Box, Container, LinearProgress } from '@mui/material'
import Head from 'next/head'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { makeStyles } from 'tss-react/mui'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const DynamicChatBox = dynamic(() => import('@/components/chat/ChatBox'), {
    loading: () => <LinearProgress />,
})

type ChatListResponse = {
    chatList: ChatListItem[]
}
type PresetListResponse = {
    presetList: Preset[]
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
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        padding: theme.spacing(3),
    },
    presetContainer: {
        marginTop: theme.spacing(2),
    },
    leftSection: {
        paddingTop: theme.spacing(3),
        flex: '1 1 30%',
        minWidth: '200px',
        height: '100%',
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    rightSection: {
        flex: '1 1 70%',
        minWidth: '400px',
        height: '100%',
        marginLeft: theme.spacing(2),
        borderLeft: `1px solid ${theme.palette.primary.main}`,
    },
}))

const Chat: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ chatList, presetList }) => {
    const { list: cList, actions: cActions } = useChatList(chatList)
    const { list: pList, actions: pActions } = usePresetList(presetList)
    const { classes } = useStyles()
    const theme = useTheme()

    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))

    // current select chat
    const [chatId, setChatId] = useState<string | undefined>()

    useEffect(() => {
        chatList.length && setChatId(chatList[0]._id)
    }, [])

    return (
        <>
            <Head>
                <title>所有对话</title>
            </Head>
            <Container className={classes.pageContainer}>
                <Box className={classes.leftSection}>
                    <ChatList
                        list={cList}
                        selectedId={isWideScreen ? chatId : ''}
                        actions={cActions}
                        onNavigate={isWideScreen ? setChatId : undefined}
                    ></ChatList>
                    <Box className={classes.presetContainer}>
                        <PresetList
                            list={pList}
                            actions={{ ...pActions, addChat: cActions.addChat }}
                            onNavigate={isWideScreen ? setChatId : undefined}
                        ></PresetList>
                    </Box>
                </Box>
                {isWideScreen && (
                    <Box className={classes.rightSection}>
                        {chatId ? (
                            <DynamicChatBox chatid={chatId} />
                        ) : (
                            <div>
                                <p>点击左侧列表立即开始聊天吧</p>
                            </div>
                        )}
                    </Box>
                )}
            </Container>
        </>
    )
}

export default Chat
