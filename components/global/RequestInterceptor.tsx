import { useEffect, useRef, useState } from 'react'
import { useNotification } from '@/src/hooks/useNotification'
import { clientRequest, errorHandleInterceptor, resHandleInterceptor } from '@/src/utils/request'
import { FCProps } from '@/types/view/common'

// client axios wrapper FC to embed hooks
export const RequestInterceptor: React.FC<FCProps> = ({ children }) => {
    const sendNotification = useNotification()

    // use interceptor before render, then children can trigger interceptor in their useEffect
    const [isSet, setIsSet] = useState(false)
    const clientResponseInterceptor = useRef(0)
    if (!isSet) {
        setIsSet(true)
        clientResponseInterceptor.current = clientRequest.interceptors.response.use(
            resHandleInterceptor,
            errorHandleInterceptor(sendNotification)
        )
    }
    // eject interceptor when unmounted
    useEffect(() => {
        return () => {
            setIsSet(false)
            clientRequest.interceptors.response.eject(clientResponseInterceptor.current)
        }
    }, [])
    return <>{children}</>
}
