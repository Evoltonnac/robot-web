import { Container, Typography } from '@mui/material'
import Head from 'next/head'

export default function Home() {
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
