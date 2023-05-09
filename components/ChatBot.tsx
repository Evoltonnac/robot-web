import { useEffect, useRef, useState } from 'react'
import { Button, OutlinedInput, Box, Grid } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { Message } from '@/types/view/chat'
import SendIcon from '@mui/icons-material/Send'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { fetchEventSource } from '@microsoft/fetch-event-source/lib/cjs/index'
import { DECODER } from '@/utils/shared'
import MessageCard from './MessageCard'
import { clientRequest } from '@/src/utils/request'
import { getAuthorizationHeader } from '@/src/utils/auth'
import { Chat } from '@/types/view/chat'
import { MessageType } from '@/types/model/chat'
import _ from 'lodash'

const useStyles = makeStyles()((theme) => ({
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

const ChatBot = ({ chatid }: { chatid: string }) => {
    // TODO: refactor styles
    const { classes } = useStyles()
    const elContainer = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [inputValue, setInputValue] = useState<string>('')
    const [messageList, setMessageList] = useState<Message[]>([])
    const isSubmitting = useRef<boolean>(false)
    const sendCtrl = useRef<AbortController>()

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
            await fetchEventSource(`/api/chat/${chatid}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthorizationHeader(),
                },
                body: JSON.stringify({ message: selfMsg }),
                signal: sendCtrl.current.signal,
                openWhenHidden: true,
                async onopen(res) {
                    if (res.ok && res.status === 200) {
                    } else {
                        throw new Error()
                    }
                },
                onmessage(msg) {
                    const buffer = msg.data.split(',') as unknown as Iterable<number>
                    const { role, content, type } = JSON.parse(DECODER.decode(Uint8Array.from(buffer)))
                    role && (newMessage.role = role)
                    type && (newMessage.type = type)
                    content && (newMessage.content += content)
                    updateMessage(newMessage, index)
                    if (msg.event === 'FatalError') {
                        throw new Error(msg.data)
                    }
                },
                onclose() {
                    throw new Error()
                },
                onerror(err) {
                    throw err
                },
            })
        } catch (e) {
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
        clientRequest.post(`/api/chat/${chatid}/clear`).then(() => {
            setMessageList([])
            isSubmitting.current = false
        })
    }
    const handleAbort = () => {
        sendCtrl.current?.abort()
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
    }, [messageList])

    useEffect(() => {
        clientRequest.get<Chat>(`/api/chat/${chatid}`).then((data) => {
            if (data?.messages?.length) {
                setMessageList(data?.messages)
            }
        })
        // abort send event stream when unmounted
        return handleAbort
    }, [])

    // abort send event stream when close
    window.addEventListener('beforeunload', handleAbort)

    return (
        <Box
            ref={elContainer}
            sx={{
                maxHeight: '100vh',
                overflow: 'scroll',
            }}
        >
            <Box pt={5} pb={20} px={2}>
                {messageList.map((item, index) => (
                    <MessageCard key={index} message={item}></MessageCard>
                ))}
                {messageList.length ? (
                    <Box textAlign="center">
                        {isLoading ? (
                            <Button onClick={handleAbort} color="error">
                                停止响应
                            </Button>
                        ) : (
                            <Button onClick={handleClear} color="error" endIcon={<DeleteOutlineRounded />}>
                                清空此对话
                            </Button>
                        )}
                    </Box>
                ) : null}
            </Box>
            <Box position="fixed" left={0} bottom={0} width="100%" px={2} pb={2} bgcolor="background.default">
                <Box className={classes.footerCard}>
                    <Grid container spacing={2}>
                        <Grid item xs>
                            <OutlinedInput size="small" value={inputValue} fullWidth onChange={handleInputChange}></OutlinedInput>
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
            </Box>
        </Box>
    )
}

export default ChatBot
