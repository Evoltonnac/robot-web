import { Container, Box, Typography } from '@mui/material'
import { Chat } from '@/types/view/chat'
import Router from 'next/router'

interface ChatListProps {
    chatList: Chat[]
}

const ChatList: React.FC<ChatListProps> = ({ chatList }) => {
    return (
        <Container>
            {chatList.map((item, index) => (
                <Box
                    key={index}
                    p={1}
                    onClick={() => {
                        Router.push(`/chat/${item._id}`)
                    }}
                >
                    <Typography>{item.messages.length ? item.messages[0].content : 'Empty Chat'}</Typography>
                </Box>
            ))}
        </Container>
    )
}

export default ChatList
