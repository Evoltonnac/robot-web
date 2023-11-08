import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { User } from '@/types/view/user'
import { FCProps } from '@/types/view/common'
import { clientRequest, pureRequest } from '@/src/utils/request'
import { throttle } from 'lodash'

interface UserContextType {
    user?: User
    action: {
        getUserInfo: () => void
        updateConfig: (config: Partial<User['config']>) => void
    }
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
    return useContext(UserContext)
}

export const UserProvider: React.FC<FCProps> = ({ children }) => {
    // get userinfo
    const [userData, setUserData] = useState<User>()

    const getUserInfo = () => {
        pureRequest.get<User>('/api/user').then((data) => {
            setUserData(data)
        })
    }
    // request onshow and try to warm-up instance
    const getUserInfoThrottle = useRef(throttle(getUserInfo, 60000))
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            getUserInfoThrottle.current()
        }
    }
    useEffect(() => {
        getUserInfoThrottle.current()
        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    // update user config
    const isUpdating = useRef(false)
    const updateConfig = useCallback((config: Partial<User['config']>) => {
        if (isUpdating.current) {
            return
        }
        isUpdating.current = true
        clientRequest
            .patch<User>(`/api/user`, { config })
            .then((data) => {
                setUserData(data)
            })
            .finally(() => {
                isUpdating.current = false
            })
    }, [])

    const userContextObj = useMemo(
        () => ({
            user: userData,
            action: {
                getUserInfo,
                updateConfig,
            },
        }),
        [updateConfig, userData]
    )

    return <UserContext.Provider value={userContextObj}>{children}</UserContext.Provider>
}
