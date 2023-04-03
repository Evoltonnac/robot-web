import { useEffect, useState } from 'react'
import { Container, Paper, Button, OutlinedInput } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Message, MessageType } from '@/types/ui/chat'
import SendIcon from '@mui/icons-material/Send'
import axios from 'axios'

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
    const [inputValue, setInputValue] = useState<string>('')
    const [messageList, setMessageList] = useState<Message[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const pushMessage = (msg: Message) => {
        setMessageList((prevState) => [...prevState, msg])
    }

    const sendMsg = (selfMsg: Message) => {
        axios.post(`/api/chat/${chatid}`, { message: selfMsg }).then((res) => {
            if (res.data?.data) {
                pushMessage(res.data?.data)
            }
        })
    }

    const handleSend = () => {
        const selfMsg: Message = {
            role: 'user',
            content: inputValue,
            type: MessageType.TEXT,
        }
        pushMessage(selfMsg)
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
                <Button variant="contained" onClick={handleSend}>
                    <SendIcon />
                </Button>
            </div>
        </Container>
    )
}
