import { Message } from '@/types/model/chat'
import { Avatar, Grid, Paper, Box } from '@mui/material'
import { deepOrange, teal } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'
import PersonIcon from '@mui/icons-material/Person'
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useTheme } from '@mui/material/styles'
import { materialDark, materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

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
    }
})

const MessageCard: React.FC<MessageCardProps> = (props) => {
    const { message } = props
    const { role } = message
    const { classes } = useStyles(props)

    const isUser = role === 'user'
    return (
        <Grid container width="90%" ml={isUser ? 0 : 'auto'} flexDirection={isUser ? 'row' : 'row-reverse'} flexWrap="nowrap" mb={2}>
            <Grid item flexShrink={0}>
                <Avatar className={classes.avatar}>{isUser ? '朕' : <PersonIcon />}</Avatar>
            </Grid>
            <Grid item flex="1" overflow="hidden" px={2} pb={1}>
                <Paper className={classes.content} elevation={2}>
                    <Markdown
                        options={{
                            wrapper: 'article',
                            forceWrapper: true,
                            overrides: {
                                pre: PreBlock,
                            },
                        }}
                    >
                        {message.content}
                    </Markdown>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default MessageCard
