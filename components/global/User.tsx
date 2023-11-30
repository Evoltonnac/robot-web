import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { User } from '@/types/view/user'
import { FCProps } from '@/types/view/common'
import { request } from '@/src/utils/request'
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
        request<User>('/api/user').then((res) => {
            res.data && setUserData(res.data)
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

    // render new config at once and throttled update user config
    const updateUserConfig = (config: Partial<User['config']>) => {
        request<User>(`/api/user`, { method: 'PATCH', data: { config } })
    }
    const updateUserConfigThrottle = useRef(throttle(updateUserConfig, 2000))
    const updateConfig = useCallback(
        (config: Partial<User['config']>) => {
            config?.activePlugins
            if (userData) {
                setUserData({
                    ...userData,
                    config: Object.assign(userData?.config || {}, config) as User['config'],
                })
            }
            updateUserConfigThrottle.current(config)
        },
        [userData]
    )

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
