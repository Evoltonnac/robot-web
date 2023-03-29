import {Button, Input} from '@mui/material'
import { useState } from 'react'
import { Message, MessageType } from '@/types/ui/chat'
import axios from 'axios'

export default function ChatBot() {
    const [inputValue, setInputValue] = useState<String>('')
    const [messageList, setMessageList] = useState<Message[]>([])

    const handleInputChange = (e :React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const pushMessage = (msg: Message) => {
        setMessageList(prevState => [...prevState, msg])
    }

    const sendMsg = (content: String) => {
        axios.post('/api/send', {content}).then(res => {
            if(res.data?.data) {
                const botMsg: Message = {
                    isSelf: 0,
                    content: res.data.data,
                    type: MessageType.TEXT
                }
                pushMessage(botMsg)
            }
        })
    }

    const handleSend = () => {
        const selfMsg: Message = {
            isSelf: 1,
            content: inputValue,
            type: MessageType.TEXT
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
            <div>
                <Input value={inputValue} onChange={handleInputChange}></Input>
                <Button variant="contained" onClick={handleSend}>send</Button>
            </div>
        </div>
    )
}