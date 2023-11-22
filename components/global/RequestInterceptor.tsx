import { useEffect, useState } from 'react'
import { useNotification } from '@/src/hooks/useNotification'
import { createRequest, request } from '@/src/utils/request'
import { FCProps } from '@/types/view/common'

export let requestWithNotification = request

// client axios wrapper FC to embed hooks
export const RequestInterceptor: React.FC<FCProps> = ({ children }) => {
    const sendNotification = useNotification()

    // use interceptor before render, then children can trigger interceptor in their useEffect
    const [isSet, setIsSet] = useState(false)
    if (!isSet) {
        setIsSet(true)
        requestWithNotification = createRequest({ sendNotification })
    }
    // eject interceptor when unmounted
    useEffect(() => {
        return () => {
            setIsSet(false)
        }
    }, [])
    return <>{children}</>
}
