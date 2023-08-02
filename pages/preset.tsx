import { PresetList, usePresetList } from '@/components/preset/PresetList'
import { clientRequest, commonRequest } from '@/src/utils/request'
import { Preset } from '@/types/view/preset'
import { Container } from '@mui/material'
import Head from 'next/head'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { makeStyles } from 'tss-react/mui'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Chat, ChatListItem } from '@/types/view/chat'
import Router from 'next/router'

type PresetListResponse = {
    presetList: Preset[]
}

export const getServerSideProps: GetServerSideProps<PresetListResponse> = async (ctx) => {
    try {
        const data = await commonRequest(ctx).get<PresetListResponse>('/api/preset')
        return {
            props: {
                presetList: data.presetList || [],
            },
        }
    } catch (error: any) {
        if (error?.response?.status === 401) {
            return {
                redirect: {
                    destination: '/login',
                    permanent: false,
                },
            }
        } else {
            throw error
        }
    }
}

const useStyles = makeStyles()((theme) => ({
    pageContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        height: '100vh',
        padding: theme.spacing(3),
    },
}))

const Preset: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ presetList }) => {
    const { list: pList, actions: pActions } = usePresetList(presetList)
    const { classes } = useStyles()
    const theme = useTheme()

    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))

    const handleAddChat = async (presetId?: string) => {
        return clientRequest.post<Chat>('/api/chat', { presetId }).then((data) => {
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
        Router.push(isWideScreen ? `/chat?chatid=${id}` : `/chat/${id}`)
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
