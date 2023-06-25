import Head from 'next/head'
import Router from 'next/router'
import Login from '@/components/user/Login'
import { useUser } from '@/components/global/User'
import { useState } from 'react'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import { Box, Button } from '@mui/material'

export default function Home() {
    const { username } = useUser() || {}
    if (username) {
        Router.replace('/chat')
    }
    const [isRegister, setIsRegister] = useState(false)
    return (
        <>
            <Head>
                <title>登录</title>
            </Head>
            <Login isRegister={isRegister}></Login>
            <Box textAlign="center">
                <Button
                    onClick={() => {
                        setIsRegister(!isRegister)
                    }}
                    color="secondary"
                    endIcon={<SwapHoriz />}
                >
                    {isRegister ? '已有账号，立即登录' : '注册新账号'}
                </Button>
            </Box>
        </>
    )
}
