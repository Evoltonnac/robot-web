'use client'
import { PresetList, usePresetList } from '@/components/preset/PresetList'
import { Container } from '@mui/material'
import Head from 'next/head'
import { makeStyles } from 'tss-react/mui'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Chat, ChatListItem } from '@/types/view/chat'
import { requestWithNotification } from '@/components/global/RequestInterceptor'
import React from 'react'
import { PresetListResponse } from './page'
import { useRouter } from 'next/navigation'

const useStyles = makeStyles()((theme) => ({
    pageContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        height: '100vh',
        padding: theme.spacing(3),
    },
}))

const Preset: React.FC<PresetListResponse> = ({ presetList }) => {
    const { list: pList, actions: pActions } = usePresetList(presetList)
    const { classes } = useStyles()
    const theme = useTheme()
    const router = useRouter()

    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))

    const handleAddChat = async (presetId?: string) => {
        return requestWithNotification<Chat>('/api/chat', { method: 'POST', data: { presetId } }).then(({ data }) => {
            const chatItem: ChatListItem = {
                ...data,
                messagesInfo: {
                    total: 0,
                    first: '',
                },
                ...(presetId && data.preset && { preset: data.preset }),
            }
            return chatItem
        })
    }

    const handleGoChat = (id: string) => {
        router.push(isWideScreen ? `/chat?chatid=${id}` : `/chat/${id}`)
    }

    return (
        <>
            <Head>
                <title>所有对话</title>
            </Head>
            <Container className={classes.pageContainer}>
                <PresetList
                    list={pList}
                    actions={{ ...pActions, addChat: handleAddChat }}
                    onNavigate={handleGoChat}
                    maxShow={20}
                ></PresetList>
            </Container>
        </>
    )
}

export default Preset
