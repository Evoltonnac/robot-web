'use client'
import { useEffect, useState } from 'react'
import { ChatList, useChatList } from '@/components/chat/ChatList'
import { PresetList, usePresetList } from '@/components/preset/PresetList'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { makeStyles } from 'tss-react/mui'
import { Box, Button, Container, LinearProgress, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ArrowRight from '@mui/icons-material/ArrowRight'
import { ChatListPageProps } from './page'

const DynamicChatBot = dynamic(() => import('@/components/chat/ChatBot'), {
    loading: () => <LinearProgress />,
})

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
    presetHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        a: {
            color: theme.palette.grey[600],
        },
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

const Chat = ({ chatList, presetList }: ChatListPageProps) => {
    const { list: cList, actions: cActions } = useChatList(chatList)
    const { list: pList, actions: pActions } = usePresetList(presetList)
    const { classes } = useStyles()
    const theme = useTheme()

    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))

    const searchParams = useSearchParams()

    // current select chat
    const [chatId, setChatId] = useState<string | undefined>()

    useEffect(() => {
        // init selected chat by url query
        const chatid = searchParams.get('chatid') || ''
        const chatExist = chatList.findIndex(({ _id }) => _id === chatid) !== -1
        chatList.length && setChatId(chatExist ? chatid : chatList[0]._id)
    }, [])

    return (
        <Container className={classes.pageContainer}>
            <Box className={classes.leftSection}>
                <Typography variant="h5" mb={2}>
                    进行中的聊天
                </Typography>
                <ChatList
                    list={cList}
                    selectedId={isWideScreen ? chatId : ''}
                    actions={cActions}
                    onNavigate={isWideScreen ? setChatId : undefined}
                ></ChatList>
                <Box className={classes.presetContainer}>
                    <Box className={classes.presetHeader} mb={2}>
                        <Typography variant="h5">我的预设</Typography>
                        <Link href="/preset">
                            <Button size="small" color="inherit">
                                更多<ArrowRight fontSize="small"></ArrowRight>
                            </Button>
                        </Link>
                    </Box>
                    <PresetList
                        list={pList}
                        actions={{ ...pActions, addChat: cActions.addChat }}
                        onNavigate={isWideScreen ? setChatId : undefined}
                        gridSize={isWideScreen ? 6 : undefined}
                    ></PresetList>
                </Box>
            </Box>
            {isWideScreen && (
                <Box className={classes.rightSection}>
                    {chatId ? (
                        <DynamicChatBot chatid={chatId} updateChatItem={cActions.updateChatItem} />
                    ) : (
                        <div>
                            <p>点击左侧列表立即开始聊天吧</p>
                        </div>
                    )}
                </Box>
            )}
        </Container>
    )
}

export default Chat
