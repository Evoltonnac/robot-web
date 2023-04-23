import { Message } from '@/types/model/chat'
import { Avatar, Box, Grid, Paper, Theme, Typography } from '@mui/material'
import { deepOrange, teal } from '@mui/material/colors'
import { makeStyles } from '@mui/styles'
import PersonIcon from '@mui/icons-material/Person'

interface MessageCardProps {
    message: Message
}

const useStyles = makeStyles<Theme, MessageCardProps>({
    userAvatar: {
        backgroundColor: deepOrange[500],
    },
    robotAvatar: {
        backgroundColor: teal[300],
    },
    message: {
        minHeight: '100%',
    },
})

const MessageCard: React.FC<MessageCardProps> = (props) => {
    const { message } = props
    const { role } = message
    const classes = useStyles(props)
    return (
        <Grid
            container
            gap={2}
            width="90%"
            ml={role === 'user' ? 0 : 'auto'}
            flexDirection={role === 'user' ? 'row' : 'row-reverse'}
            flexWrap="nowrap"
            mb={2}
        >
            <Grid item flexShrink={0}>
                <Avatar className={role === 'user' ? classes.userAvatar : classes.robotAvatar}>
                    {role === 'user' ? '朕' : <PersonIcon />}
                </Avatar>
            </Grid>
            <Grid item xs={10} flexShrink={1}>
                <Paper className={classes.message} elevation={2}>
                    <Typography variant="body1" p={1} whiteSpace="pre-wrap">
                        {message.content}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    )
}

export default MessageCard
