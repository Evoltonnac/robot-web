import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@mui/material'
import { Chat, ChatListItem } from '@/types/view/chat'
import Router from 'next/router'
import { clientRequest } from '@/src/utils/request'
import { useRef, useState } from 'react'
import { Delete, Add } from '@mui/icons-material'
import { makeStyles } from 'tss-react/mui'

export const useChatList = (chatList: ChatListItem[]) => {
    const [list, setList] = useState<ChatListItem[]>(chatList)
    const addChat = () => {
        return clientRequest.post<Chat>('/api/chat').then((data) => {
            setList(
                list.concat([
                    {
                        ...data,
                        messagesInfo: {
                            total: 0,
                            first: '',
                        },
                    },
                ])
            )
            return data
        })
    }
    const deleteChat = (id: string) => {
        return clientRequest.delete<Chat>(`/api/chat/${id}`).then(() => {
            const deletedIdx = list.findIndex(({ _id }) => _id === id)
            const newList = [...list]
            const deletedChat = newList.splice(deletedIdx, 1)
            setList(newList)
            return deletedChat[0]
        })
    }
    return {
        list,
        actions: {
            addChat,
            deleteChat,
        },
    }
}

const useStyles = makeStyles()((theme) => ({
    chatItem: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        '& + &': {
            marginTop: theme.spacing(2),
        },
    },
}))

interface ChatListProps {
    list: ChatListItem[]
    actions: {
        addChat: () => Promise<Chat>
        deleteChat: (id: string) => Promise<Chat | undefined>
    }
}

export const ChatList: React.FC<ChatListProps> = ({ list, actions }) => {
    const { classes } = useStyles()
    const curDeleting = useRef<string>('')

    const handleGoChat = (id: string) => {
        curDeleting.current !== id && Router.push(`/chat/${id}`)
    }

    const handleAddChat = async () => {
        const newChat = await actions.addChat()
        setTimeout(() => {
            handleGoChat(newChat._id)
        }, 300)
    }

    const handleDeleteChat = async (id: string) => {
        if (curDeleting.current) {
            return
        }
        curDeleting.current = id
        try {
            await actions.deleteChat(id)
            curDeleting.current = ''
        } catch (e) {
            curDeleting.current = ''
        }
    }

    return (
        <List>
            {list.map((item) => (
                <ListItem
                    classes={{ container: classes.chatItem }}
                    key={item._id}
                    onClick={() => {
                        handleGoChat(item._id)
                    }}
                >
                    <ListItemText
                        primary={item.messagesInfo.total ? item.messagesInfo.first : '还没开始聊天，点击进入'}
                        primaryTypographyProps={{
                            noWrap: true,
                        }}
                        secondary={item.messagesInfo.total ? `共${item.messagesInfo.total}条` : null}
                    />
                    <ListItemSecondaryAction>
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                                handleDeleteChat(item._id)
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
            <ListItem classes={{ container: classes.chatItem }} onClick={handleAddChat}>
                <ListItemText primary="开始新一轮聊天" />
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="add">
                        <Add />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    )
}
