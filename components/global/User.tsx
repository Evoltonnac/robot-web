import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types/view/user'
import { FCProps } from '@/types/view/common'
import { clientRequest } from '@/src/utils/request'

const UserContext = createContext<User | undefined>(undefined)

export const useUser = () => {
    return useContext(UserContext)
}

export const UserProvider: React.FC<FCProps> = ({ children }) => {
    const [userData, setUserData] = useState<User>()
    useEffect(() => {
        clientRequest.get('/api/user').then((data) => {
            setUserData(data)
        })
    }, [])
    return <UserContext.Provider value={userData}>{children}</UserContext.Provider>
}
