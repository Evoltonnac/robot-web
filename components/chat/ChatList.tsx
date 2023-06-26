import { List, ListItem, ListItemText, IconButton, ListItemSecondaryAction, Typography, Box, Chip } from '@mui/material'
import { Chat, ChatListItem } from '@/types/view/chat'
import Router from 'next/router'
import { clientRequest } from '@/src/utils/request'
import { useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import BookmarkBorder from '@mui/icons-material/BookmarkBorder'

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
    return {
        list,
        actions: {
            addChat,
            deleteChat,
        },
    }
}

const useStyles = makeStyles()((theme) => {
    const chatItem = {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        '& + &': {
            marginTop: theme.spacing(2),
        },
    }
    return {
        chatItem,
        chatAddItem: {
            ...chatItem,
            marginTop: theme.spacing(2),
            border: '2px dashed',
            borderColor: theme.palette.primary.main,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
        },
        chatItemSecondary: {
            display: 'flex',
            alignItems: 'center',
            marginTop: theme.spacing(1),
        },
        chatItemBadge: {
            marginLeft: theme.spacing(2),
        },
    }
})

interface ChatListProps {
    list: ChatListItem[]
    actions: {
        addChat: () => Promise<ChatListItem>
        deleteChat: (id: string) => Promise<ChatListItem>
    }
    onAttachChat?: (id: string) => void
    onDestroyChat?: (id: string) => void
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

    const ChatItemSecondary = ({ chatItem }: { chatItem: ChatListItem }) => (
        <Box className={classes.chatItemSecondary}>
            {chatItem.messagesInfo.total ? `共${chatItem.messagesInfo.total}条` : null}
            {chatItem.preset?.title ? (
                <Chip
                    className={classes.chatItemBadge}
                    color="primary"
                    size="small"
                    label={chatItem.preset.title}
                    icon={<BookmarkBorder />}
                ></Chip>
            ) : null}
        </Box>
    )

    return (
        <>
            <Typography variant="h5" mb={2}>
                进行中的聊天
            </Typography>
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
        </>
    )
}
