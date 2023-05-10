import { clientRequest } from '@/src/utils/request'
import { Container, Typography } from '@mui/material'
import Head from 'next/head'
import { useEffect } from 'react'

export default function Home() {
    useEffect(() => {
        clientRequest.get('/api/test')
    }, [])
    return (
        <>
            <Head>
                <title>首页</title>
            </Head>
            <Container>
                <Typography variant="h1" gutterBottom>
                    欢迎，首页
                </Typography>
            </Container>
        </>
    )
}
