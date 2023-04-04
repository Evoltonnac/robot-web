import { useEffect, useState } from 'react'
import { Container, Paper, Button, OutlinedInput } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Message, MessageType } from '@/types/model/chat'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'
import { fetchEventSource } from '@microsoft/fetch-event-source'

const useStyles = makeStyles({
    // css 对象
    footer: {
        width: '100%',
        position: 'fixed',
        left: 0,
        bottom: 0,
        display: 'flex',
    },
    input: {
        flex: 1,
    },
})
export default function ChatBot({ chatid }: { chatid: string }) {
    // TODO: refactor styles
    const classes = useStyles()
    const [isLoading, setIsLoading] = useState(false)
    const [inputValue, setInputValue] = useState<string>('')
    const [messageList, setMessageList] = useState<Message[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const updateMessage = (msg: Message, index?: number) => {
        setMessageList((prevState) => {
            const length = prevState.length
            if (typeof index !== 'number' || index === length) {
                return [...prevState, msg]
            } else if (index >= 0 && index < length) {
                return prevState.splice(index, 1, msg)
            }
            return prevState
        })
    }

    const sendMsg = async (selfMsg: Message) => {
        setIsLoading(true)
        let index = -1
        try {
            await fetchEventSource(`/api/chat/${chatid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: selfMsg }),
                async onopen(res) {
                    if (res.ok && res.status === 200) {
                        index = messageList.length
                    } else {
                        throw new Error()
                    }
                },
                onmessage(msg) {
                    console.log(msg)
                    updateMessage(
                        {
                            role: 'assistant',
                            content: msg.data,
                            type: MessageType.TEXT,
                        },
                        index
                    )
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

    const handleSend = () => {
        const selfMsg: Message = {
            role: 'user',
            content: inputValue,
            type: MessageType.TEXT,
        }
        updateMessage(selfMsg)
        setInputValue('')
        sendMsg(selfMsg)
    }

    // TODO: getInitialProps
    useEffect(() => {
        axios.get(`/api/chat/${chatid}`).then((res) => {
            if (res.data?.data?.messages?.length) {
                setMessageList(res.data?.data?.messages)
            }
        })
    }, [])

    return (
        <Container>
            <div>
                {messageList.map((item, index) => (
                    <Paper key={index}>{item.content}</Paper>
                ))}
            </div>
            <div className={classes.footer}>
                <OutlinedInput className={classes.input} value={inputValue} onChange={handleInputChange}></OutlinedInput>
                <Button variant="contained" onClick={handleSend} disabled={isLoading || !inputValue}>
                    <SendIcon />
                </Button>
            </div>
        </Container>
    )
}
