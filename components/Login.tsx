import { clientRequest } from '@/src/utils/request'
import { Container, OutlinedInput, Button } from '@mui/material'
import { useState } from 'react'
import Router from 'next/router'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [stage, setStage] = useState<0 | 1>(0)

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = () => {
        if (stage === 0) {
            setStage(1)
        } else if (stage === 1) {
            clientRequest.post('/api/user/login', { username, password }).then(() => {
                Router.replace('/chat')
            })
        }
    }

    return (
        <Container>
            <OutlinedInput size="small" value={username} fullWidth onChange={handleUsernameChange}></OutlinedInput>
            {stage === 1 ? (
                <OutlinedInput type="password" size="small" value={password} fullWidth onChange={handlePasswordChange}></OutlinedInput>
            ) : null}
            <Button onClick={handleSubmit}>{stage === 0 ? '下一步' : '一键登录'}</Button>
        </Container>
    )
}
