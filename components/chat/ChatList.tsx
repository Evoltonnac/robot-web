import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction, Box, Chip } from '@mui/material'
import { Chat, ChatListItem } from '@/types/view/chat'
import Router from 'next/router'
import { clientRequest } from '@/src/utils/request'
import { useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import BookmarkBorder from '@mui/icons-material/BookmarkBorder'
import clsx from 'clsx'

export const useChatList = (chatList: ChatListItem[]) => {
    const [list, setList] = useState<ChatListItem[]>(chatList)
    const addChat = (presetId?: string) => {
        return clientRequest.post<Chat>('/api/chat', { presetId }).then((data) => {
            const chatItem: ChatListItem = {
                ...data,
                messagesInfo: {
                    total: 0,
                    first: '',
                },
                ...(presetId && data.preset && { preset: data.preset }),
            }
            setList(list.concat([chatItem]))
            return chatItem
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
    const updateChatItem = (id: string, messagesInfo: ChatListItem['messagesInfo']) => {
        const updatedIdx = list.findIndex(({ _id }) => _id === id)
        const newList = [...list]
        newList[updatedIdx] = { ...newList[updatedIdx], messagesInfo }
        setList(newList)
        return newList[updatedIdx]
    }
    return {
        list,
        actions: {
            addChat,
            deleteChat,
            updateChatItem,
        },
    }
}

const useStyles = makeStyles()((theme) => {
    const chatItem = {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        cursor: 'pointer',
        overflow: 'hidden',
        marginTop: theme.spacing(2),
        borderLeft: `4px solid transparent`,
        borderRight: `4px solid transparent`,
    }
    return {
        chatItem,
        chatAddItem: {
            ...chatItem,
            marginTop: theme.spacing(2),
            border: '1px dashed',
            borderColor: theme.palette.primary.main,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
            opacity: 0.6,
            transition: 'all 0.2s',
            '&:hover, &:active': {
                opacity: 1,
            },
        },
        selectedChatItem: {
            borderLeftColor: theme.palette.primary.main,
        },
        chatItemSecondary: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(1),
        },
        chatItemTotal: {
            marginRight: theme.spacing(2),
        },
    }
})

interface ChatListProps {
    list: ChatListItem[]
    selectedId?: string
    actions: {
        addChat: () => Promise<ChatListItem>
        deleteChat: (id: string) => Promise<ChatListItem>
    }
    onNavigate?: (id: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({ list, actions, onNavigate, selectedId }) => {
    const { classes } = useStyles()
    const curDeleting = useRef<string>('')

    const handleGoChat = (id: string) => {
        if (onNavigate) {
            onNavigate(id)
        } else {
            curDeleting.current !== id && Router.push(`/chat/${id}`)
        }
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
            if (selectedId === id) {
                onNavigate?.('')
            }
        } catch (e) {
            curDeleting.current = ''
        }
    }

    const ChatItemSecondary = ({ chatItem }: { chatItem: ChatListItem }) => {
        const total = chatItem.messagesInfo.total
        const presetTitle = chatItem.preset?.title
        const isShow = total || presetTitle
        return isShow ? (
            <Box className={classes.chatItemSecondary}>
                {total ? <span className={classes.chatItemTotal}>共{total}条</span> : null}
                {presetTitle ? <Chip color="primary" size="small" label={presetTitle} icon={<BookmarkBorder />}></Chip> : null}
            </Box>
        ) : null
    }

    return (
        <List sx={{ mt: -2 }}>
            {list.map((item) => (
                <ListItem
                    classes={{ container: clsx(classes.chatItem, { [classes.selectedChatItem]: selectedId === item._id }) }}
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
                        secondary={<ChatItemSecondary chatItem={item} />}
                        secondaryTypographyProps={{
                            component: 'div',
                        }}
                    />

                    <ListItemSecondaryAction>
                        <IconButton
                            edge="end"
                            aria-label="delete"
                            color="error"
                            onClick={() => {
                                handleDeleteChat(item._id)
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            ))}
            <ListItem classes={{ container: classes.chatAddItem }} onClick={handleAddChat}>
                <ListItemText primary="开始新一轮聊天" />
                <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="add" color="primary">
                        <Add />
                    </IconButton>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    )
}
