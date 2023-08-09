import React, { useEffect, useRef, useState } from 'react'
import { Button, TextField, Box, Grid, Chip } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { ChatListItem, Message } from '@/types/view/chat'
import SendIcon from '@mui/icons-material/Send'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { DECODER } from '@/utils/shared'
import MessageCard from './MessageCard'
import { clientRequest } from '@/src/utils/request'
import { getAuthorizationHeader } from '@/src/utils/auth'
import { Chat } from '@/types/view/chat'
import { MessageType } from '@/types/model/chat'
import _ from 'lodash'
import { Preset } from '@/types/view/preset'
import { MAX_ROUNDS } from '@/utils/constant'
import { useUser } from '../global/User'
import ConfigPanel from '../user/ConfigPanel'

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
        maxHeight: '100vh',
        overflow: 'hidden auto',
        position: 'relative',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    contentArea: {
        padding: `${theme.spacing(5)} ${theme.spacing(2)} ${theme.spacing(20)}`,
        height: '100%',
        overflow: 'hidden auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    configButton: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
    },
    roundsChip: {
        position: 'absolute',
        top: `-${theme.spacing(1)}`,
        right: theme.spacing(2),
        transform: 'translateY(-100%)',
    },
    footerCard: {
        width: '100%',
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
    },
    sendButton: {
        height: '100%',
    },
}))

interface ChatBotProps {
    chatid?: string
    updateChatItem?: (id: string, messagesInfo: ChatListItem['messagesInfo']) => void
}

const ChatBot: React.FC<ChatBotProps> = ({ chatid, updateChatItem }) => {
    const { user } = useUser() || {}
    const { classes } = useStyles()
    const elContainer = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [inputValue, setInputValue] = useState<string>('')
    const [messageList, setMessageList] = useState<Message[]>([])
    const [preset, setPreset] = useState<Preset>()
    const isSubmitting = useRef<boolean>(false)
    const sendCtrl = useRef<AbortController | null>()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const updateMessage = (msg: Message, index?: number) => {
        setMessageList((prevState) => {
            const length = prevState.length
            if (typeof index !== 'number' || index === length) {
                return [...prevState, msg]
            } else if (index >= 0 && index < length) {
                prevState.splice(index, 1, msg)
                return [...prevState]
            }
            return prevState
        })
    }

    const removeMessage = (index: number) => {
        setMessageList((prevState) => {
            const length = prevState.length
            if (index >= 0 && index < length) {
                prevState.splice(index, 1)
                return [...prevState]
            }
            return prevState
        })
    }

    // send msg to api and receive stream
    const sendMsg = async (selfMsg: Message, index: number) => {
        setIsLoading(true)
        sendCtrl.current = new AbortController()
        try {
            const newMessage: Message = {
                role: 'assistant',
                type: MessageType.TEXT,
                content: '',
                _id: '' + Date.now(),
            }
            updateMessage(newMessage, index)
            const res = await fetch(`/api/chat/${chatid}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthorizationHeader(),
                },
                body: JSON.stringify({
                    message: selfMsg,
                    serpEnabled: user?.config?.serpEnabled,
                }),
                signal: sendCtrl.current.signal,
            })
            if (!res.ok || !res.body) {
                removeMessage(index)
                throw new Error('未知错误')
            } else {
                const reader = res.body.getReader()

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) {
                        break
                    }
                    const chunkData = DECODER.decode(value)
                    if (chunkData) {
                        newMessage.content += chunkData
                        updateMessage(newMessage, index)
                    }
                    if (sendCtrl.current === null) {
                        reader.cancel()
                        break
                    }
                }
                setIsLoading(false)
            }
        } catch (e) {
            removeMessage(index)
            setIsLoading(false)
        }
    }

    const handleSend = async () => {
        if (isSubmitting.current) {
            return
        }
        isSubmitting.current = true
        const selfMsg: Message = {
            role: 'user',
            content: inputValue,
            type: MessageType.TEXT,
            _id: '' + Date.now(),
        }
        updateMessage(selfMsg)
        setInputValue('')
        await sendMsg(selfMsg, messageList.length + 1)
        isSubmitting.current = false
    }

    const handleClear = () => {
        if (isSubmitting.current) {
            return
        }
        isSubmitting.current = true
        clientRequest
            .post(`/api/chat/${chatid}/clear`)
            .then(() => {
                setMessageList([])
            })
            .finally(() => {
                isSubmitting.current = false
            })
    }
    const handleAbort = () => {
        sendCtrl.current?.abort()
        sendCtrl.current = null
        setIsLoading(false)
    }

    const scrollToBottom = _.throttle(() => {
        const el = elContainer.current
        if (el) {
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        }
    }, 300)

    useEffect(() => {
        scrollToBottom()
        chatid &&
            updateChatItem &&
            updateChatItem(chatid, {
                total: messageList.length,
                first: messageList[0]?.content || '',
            })
    }, [messageList])

    useEffect(() => {
        chatid &&
            clientRequest.get<Chat>(`/api/chat/${chatid}`).then(({ messages, preset }) => {
                if (typeof messages?.length === 'number') {
                    setMessageList(messages)
                }
                setPreset(preset)
            })
        // abort send event stream when unmounted
        return handleAbort
    }, [chatid])

    // abort send event stream when close
    window.addEventListener('beforeunload', handleAbort)

    // current chat rounds
    const chatRounds = messageList.filter(({ role }) => role === 'assistant').length
    return (
        <Box className={classes.container}>
            {chatid ? (
                <>
                    <Box ref={elContainer} className={classes.contentArea}>
                        {messageList.map((item, index) => (
                            <MessageCard
                                key={index}
                                message={item}
                                botAvatar={preset?.avatar}
                                isLoading={isLoading && index === messageList.length - 1}
                            ></MessageCard>
                        ))}
                        {messageList.length ? (
                            <Box textAlign="center">
                                {isLoading ? null : (
                                    // <Button variant="outlined" onClick={handleAbort} color="error">
                                    //     停止响应
                                    // </Button>
                                    <Button variant="outlined" onClick={handleClear} color="error" endIcon={<DeleteOutlineRounded />}>
                                        清空此对话
                                    </Button>
                                )}
                            </Box>
                        ) : null}
                    </Box>
                    <ConfigPanel className={classes.configButton}></ConfigPanel>
                    <Box position="absolute" left={0} bottom={0} width="100%" px={2} pb={2} bgcolor="background.default">
                        <Chip className={classes.roundsChip} label={`对话轮数${chatRounds}/${MAX_ROUNDS}`} color="primary" />
                        {chatRounds < MAX_ROUNDS ? (
                            <Box className={classes.footerCard}>
                                <Grid container spacing={2}>
                                    <Grid item xs>
                                        <TextField
                                            size="small"
                                            value={inputValue}
                                            fullWidth
                                            placeholder="说些什么吧~"
                                            multiline
                                            minRows={1}
                                            maxRows={3}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item width={100} alignSelf="stretch">
                                        <Button
                                            className={classes.sendButton}
                                            variant="contained"
                                            fullWidth
                                            onClick={handleSend}
                                            disabled={isLoading || !inputValue}
                                        >
                                            <SendIcon />
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        ) : null}
                    </Box>
                </>
            ) : null}
        </Box>
    )
}

export default ChatBot