import { Message } from '@/types/view/chat'
import { Avatar, Grid, Paper, Box } from '@mui/material'
import { deepOrange, teal } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useTheme } from '@mui/material/styles'
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useUser } from '../global/User'
import Image from 'next/image'
import { LoadingBalls, RobotIcon } from '../common/Icons'

const ImgBlock: MarkdownToJSX.Override = ({ src, alt, title, className }) => {
    return (
        <Image
            src={src}
            alt={alt}
            title={title}
            className={className}
            width={0}
            height={0}
            sizes="100vw"
            loading="lazy"
            placeholder="empty"
        />
    )
}
const PreBlock: MarkdownToJSX.Override = ({ children }) => {
    const { palette } = useTheme()

    if (children && children.type && children.type === 'code') {
        const lang = children.props.className ? children.props.className.replace('lang-', '') : 'tsx'
        const codeStyle = palette.mode === 'light' ? materialLight : materialDark
        return (
            <SyntaxHighlighter language={lang} style={codeStyle}>
                {children.props.children}
            </SyntaxHighlighter>
        )
    }
    return (
        <Box component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {children}
        </Box>
    )
}

interface MessageCardProps {
    message: Message
    botAvatar?: string
    isLoading?: boolean
}

const useStyles = makeStyles<MessageCardProps>()((theme, { message }) => {
    const isUser = message.role === 'user'
    return {
        avatar: {
            backgroundColor: isUser ? deepOrange[500] : teal[300],
        },
        content: {
            width: 'max-content',
            maxWidth: '100%',
            padding: theme.spacing(1),
            overflow: 'hidden',
            marginLeft: isUser ? '0' : 'auto',
            marginRight: isUser ? 'auto' : '0',
        },
        loadingContent: {
            width: '75px',
            height: '32.5px',
            color: theme.palette.primary.main,
            '>svg': {
                width: '100%',
                height: '100%',
            },
        },
        mdImage: {
            minWidth: '50px',
            minHeight: '50px',
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage:
                'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDsgZGlzcGxheTogYmxvY2s7IiB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+CjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0ibGRpby00a3VkcWl2OW5xNy1ncmFkaWVudCIgY3g9IjAuNSIgY3k9IjAuNSIgZng9IjAiIGZ5PSIwIiByPSIyIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2Q5ZGJlZSI+PC9zdG9wPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM1ZTZmYTMiPjwvc3RvcD4KPC9yYWRpYWxHcmFkaWVudD48L2RlZnM+CjxnPgo8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIzMCIgc3Ryb2tlPSIjYjNiN2UyIiBzdHJva2Utd2lkdGg9IjEyIiBmaWxsPSJub25lIiBzdHJva2Utb3BhY2l0eT0iMC43Ij48L2NpcmNsZT4KPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzAiIHN0cm9rZT0idXJsKCNsZGlvLTRrdWRxaXY5bnE3LWdyYWRpZW50KSIgc3Ryb2tlLXdpZHRoPSIxMCIgZmlsbD0ibm9uZSI+PC9jaXJjbGU+CjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiB0aW1lcz0iMDsxIiBkdXI9IjEuMTc2NDcwNTg4MjM1Mjk0MnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+CjwvZz4KPC9zdmc+)',
        },
    }
})

const MessageCard: React.FC<MessageCardProps> = (props) => {
    const user = useUser()
    const { message, botAvatar, isLoading } = props
    const { role } = message
    const { classes } = useStyles(props)

    const isUser = role === 'user'
    return (
        <Grid container width="90%" ml={isUser ? 0 : 'auto'} flexDirection={isUser ? 'row' : 'row-reverse'} flexWrap="nowrap" mb={2}>
            <Grid item flexShrink={0}>
                {isUser ? (
                    <Avatar className={classes.avatar} alt={user?.username.toUpperCase() || ''} />
                ) : (
                    <Avatar className={classes.avatar} src={botAvatar}>
                        <RobotIcon />
                    </Avatar>
                )}
            </Grid>
            <Grid item flex="1" overflow="hidden" px={2} pb={1}>
                <Paper className={classes.content} elevation={0}>
                    {isLoading && !message.content ? (
                        <div className={classes.loadingContent}>
                            <LoadingBalls></LoadingBalls>
                        </div>
                    ) : (
                        <Markdown
                            options={{
                                wrapper: 'article',
                                forceWrapper: true,
                                overrides: {
                                    pre: PreBlock,
                                    img: {
                                        component: ImgBlock,
                                        props: {
                                            className: classes.mdImage,
                                        },
                                    },
                                },
                            }}
                        >
                            {message.content}
                        </Markdown>
                    )}
                </Paper>
            </Grid>
        </Grid>
    )
}

export default MessageCard
