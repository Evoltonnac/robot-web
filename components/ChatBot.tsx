import { useState } from 'react'
import { Button, Input } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Message, MessageType } from '@/types/ui/chat'
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
export default function ChatBot() {
    const classes = useStyles()
    const [inputValue, setInputValue] = useState<string>('')
    const [messageList, setMessageList] = useState<Message[]>([])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const pushMessage = (msg: Message) => {
        setMessageList((prevState) => [...prevState, msg])
    }

    const sendMsg = (content: string) => {
        axios.post('/api/send', { content }).then((res) => {
            if (res.data?.data) {
                const botMsg: Message = {
                    isSelf: 0,
                    content: res.data.data,
                    type: MessageType.TEXT,
                }
                pushMessage(botMsg)
            }
        })
    }

    const handleSend = () => {
        const selfMsg: Message = {
            isSelf: 1,
            content: inputValue,
            type: MessageType.TEXT,
        }
        pushMessage(selfMsg)
        sendMsg(inputValue)
    }

    return (
        <div>
            <div>
                {messageList.map((item, index) => (
                    <div key={index}>{item.content}</div>
                ))}
            </div>
            <div className={classes.footer}>
                <Input className={classes.input} value={inputValue} onChange={handleInputChange}></Input>
                <Button variant="contained" onClick={handleSend}>
                    send
                </Button>
            </div>
        </div>
    )
}
