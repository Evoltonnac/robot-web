import { ChatListItem } from '@/types/view/chat'
import { cookies } from 'next/headers'
import { createRequest } from '@/src/utils/request'
import { redirect } from 'next/navigation'
import { Preset } from '@/types/view/preset'
import ChatPage from './pageClient'

type ChatListResponse = {
    chatList: ChatListItem[]
}
type PresetListResponse = {
    presetList: Preset[]
}
export type ChatListPageProps = ChatListResponse & PresetListResponse

export const getList = async (): Promise<ChatListPageProps> => {
    try {
        const prefetch = createRequest({
            cookies: cookies(),
        })
        const [data1, data2] = await Promise.all([prefetch<ChatListResponse>('/api/chat'), prefetch<PresetListResponse>('/api/preset')])
        return {
            chatList: data1.data.chatList || [],
            presetList: data2.data.presetList || [],
        }
    } catch (error: any) {
        if (error?.status === 401) {
            return redirect('/login')
        } else {
            throw error
        }
    }
}

export default async function Page() {
    const data = await getList()
    return <ChatPage {...data}></ChatPage>
}
