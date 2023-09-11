import { clientRequest } from '@/src/utils/request'
import { Button, TextField, Grid } from '@mui/material'
import { useState } from 'react'
import Router from 'next/router'
import { useNotification } from '@/src/hooks/useNotification'
import { useUser } from '../global/User'

interface LoginProps {
    isRegister?: boolean
}

const Login: React.FC<LoginProps> = ({ isRegister }) => {
    const sendNotification = useNotification()

    const { action } = useUser() || {}

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
            if (!username) {
                sendNotification({ msg: '请输入用户名', variant: 'error' })
                return
            }
            setStage(1)
        } else if (stage === 1) {
            if (isRegister) {
                if (password !== repeatPassword) {
                    sendNotification({ msg: '请保证两次密码输入一致', variant: 'error' })
                    return
                }
                clientRequest.post('/api/user', { username, password }).then(() => {
                    action?.getUserInfo()
                    Router.replace('/chat')
                })
            } else {
                clientRequest.post('/api/user/login', { username, password }).then(() => {
                    action?.getUserInfo()
                    Router.replace('/chat')
                })
            }
        }
    }

    return (
        <Grid container spacing={2} direction="column" alignItems="center">
            <Grid item>
                <TextField size="small" id="username" label="用户名" variant="outlined" value={username} onChange={handleUsernameChange} />
            </Grid>
            {stage === 1 ? (
                <>
                    <Grid item>
                        <TextField
                            size="small"
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
                                size="small"
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
            <Grid item width="100%" mt={1}>
                <Button variant="contained" fullWidth onClick={handleSubmit}>
                    {stage === 0 ? '下一步' : '一键登录'}
                </Button>
            </Grid>
        </Grid>
    )
}

export default Login
