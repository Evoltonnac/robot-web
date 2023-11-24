import { cookies } from 'next/headers'
import { createRequest } from '@/src/utils/request'
import { redirect } from 'next/navigation'
import { Preset } from '@/types/view/preset'
import PresetPage from './pageClient'

export type PresetListResponse = {
    presetList: Preset[]
}

const getList = async (): Promise<PresetListResponse> => {
    try {
        const prefetch = createRequest({
            cookies: cookies(),
        })
        const { data } = await prefetch<PresetListResponse>('/api/preset')
        return {
            presetList: data.presetList || [],
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
    return <PresetPage {...data}></PresetPage>
}
