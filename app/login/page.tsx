'use client'
import { useRouter } from 'next/navigation'
import Login from '@/components/user/Login'
import { useUser } from '@/components/global/User'
import { useEffect, useState } from 'react'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import { Box, Button } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { makeStyles } from 'tss-react/mui'
import { LogoText } from '@/components/common/Icons'

const useStyles = makeStyles<{ isWideScreen: boolean }>()((theme, { isWideScreen }) => ({
    page: {
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(https://static.mhxing.top/assets/home/home-bg-1.jpg)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: isWideScreen ? '100% auto' : 'auto 100%',
        overflow: 'hidden',
    },
    loginContainer: {
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        width: isWideScreen ? '370px' : '80%',
        maxWidth: '370px',
        padding: isWideScreen ? '30px 20px' : '30px 0 15px',
        margin: `${isWideScreen ? '150px' : '120px'} auto auto`,
        borderRadius: '10px',
    },
    loginLogo: {
        width: '100%',
        height: '32px',
        marginBottom: '20px',
        zIndex: 1,
        color: theme.palette.background.paper,
    },
    loginBackgroundShape: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '82px',
        backgroundColor: theme.palette.primary.main,
    },
}))

export default function Home() {
    const router = useRouter()
    const theme = useTheme()
    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))
    const { classes } = useStyles({ isWideScreen })

    const { user } = useUser() || {}
    if (user?.username) {
        // router.replace('/chat')
    }
    const [isRegister, setIsRegister] = useState(false)

    useEffect(() => {
        document.title = '登录'
    }, [])
    return (
        <Box className={classes.page}>
            <Box className={classes.loginContainer}>
                <LogoText className={classes.loginLogo} />
                <div className={classes.loginBackgroundShape}></div>
                <Box pt={3} px={2} pb={3}>
                    <Login isRegister={isRegister}></Login>
                </Box>
                <Button
                    onClick={() => {
                        setIsRegister(!isRegister)
                    }}
                    sx={{ color: theme.palette.grey[700] }}
                    endIcon={<SwapHoriz />}
                >
                    {isRegister ? '已有账号，立即登录' : '注册新账号'}
                </Button>
            </Box>
        </Box>
    )
}
