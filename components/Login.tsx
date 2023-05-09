import { clientRequest } from '@/src/utils/request'
import { Button, TextField, Grid } from '@mui/material'
import { useState } from 'react'
import Router from 'next/router'
import { useNotification } from '@/src/hooks/useNotification'

interface LoginProps {
    isRegister?: boolean
}

const Login: React.FC<LoginProps> = ({ isRegister }) => {
    const sendNotification = useNotification()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [stage, setStage] = useState<0 | 1>(0)

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }
    const handleRepeatPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatPassword(e.target.value)
    }

    const handleSubmit = () => {
        if (stage === 0) {
            setStage(1)
        } else if (stage === 1) {
            if (isRegister) {
                if (password !== repeatPassword) {
                    sendNotification({ msg: '请保证两次密码输入一致', variant: 'error' })
                    return
                }
                clientRequest.post('/api/user', { username, password }).then(() => {
                    Router.replace('/chat')
                })
            } else {
                clientRequest.post('/api/user/login', { username, password }).then(() => {
                    Router.replace('/chat')
                })
            }
        }
    }

    return (
        <Grid p={5} container spacing={2} direction="column" alignItems="center">
            <Grid item>
                <TextField
                    aria-required={false}
                    id="username"
                    label="用户名"
                    variant="outlined"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </Grid>
            {stage === 1 ? (
                <>
                    <Grid item>
                        <TextField
                            aria-required={false}
                            id="password"
                            label="密码"
                            variant="outlined"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </Grid>
                    {isRegister ? (
                        <Grid item>
                            <TextField
                                aria-required={false}
                                id="repeat-password"
                                label="重复密码"
                                variant="outlined"
                                type="password"
                                value={repeatPassword}
                                onChange={handleRepeatPasswordChange}
                            />
                        </Grid>
                    ) : null}
                </>
            ) : null}
            <Button onClick={handleSubmit}>{stage === 0 ? '下一步' : '一键登录'}</Button>
        </Grid>
    )
}

export default Login
