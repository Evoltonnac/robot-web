import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentProps, DocumentContext } from 'next/document'
import createEmotionServer from '@emotion/server/create-instance'
import { AppType } from 'next/app'
import theme from '@/src/themes/lightTheme'
import createEmotionCache from '@/src/themes/createEmotionCache'
import { ServerStyleSheets } from '@mui/styles'
import { MyAppProps } from './_app'

interface MyDocumentProps extends DocumentProps {
    emotionStyleTags: JSX.Element[]
}

export default function MyDocument({ emotionStyleTags }: MyDocumentProps) {
    return (
        <Html lang="en">
            <Head>
                {/* PWA primary color */}
                <meta name="theme-color" content={theme.palette.primary.main} />
                <link rel="shortcut icon" href="/robotWebLogo.ico" />
                <meta name="emotion-insertion-point" content="" />
                {emotionStyleTags}
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
    const originalRenderPage = ctx.renderPage

    const cache = createEmotionCache()
    const { extractCriticalToChunks } = createEmotionServer(cache)

    const sheets = new ServerStyleSheets()

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType> & MyAppProps>) =>
                function EnhanceApp(props) {
                    return sheets.collect(<App emotionCache={cache} {...props} />)
                },
        })

    const initialProps = await Document.getInitialProps(ctx)
    // This is important. It prevents Emotion to render invalid HTML.
    // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
    const emotionStyles = extractCriticalToChunks(initialProps.html)
    const emotionStyleTags = emotionStyles.styles.map((style) => (
        <style
            data-emotion={`${style.key} ${style.ids.join(' ')}`}
            key={style.key}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: style.css }}
        />
    ))
    return {
        ...initialProps,
        styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
        emotionStyleTags,
    }
}
