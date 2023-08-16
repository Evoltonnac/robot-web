import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { User } from '@/types/view/user'
import { FCProps } from '@/types/view/common'
import { clientRequest, pureRequest } from '@/src/utils/request'

interface UserContextType {
    user?: User
    action: {
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
    useEffect(() => {
        pureRequest.get<User>('/api/user').then((data) => {
            setUserData(data)
        })
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
                updateConfig,
            },
        }),
        [updateConfig, userData]
    )
    return <UserContext.Provider value={userContextObj}>{children}</UserContext.Provider>
}
