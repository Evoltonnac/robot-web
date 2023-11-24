'use client'
import { Box, Container, Skeleton, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()((theme) => ({
    pageContainer: {
        display: 'flex',
        alignItems: 'center',
        height: '100vh',
        padding: theme.spacing(3),
    },
    presetContainer: {
        marginTop: theme.spacing(2),
    },
    leftSection: {
        paddingTop: theme.spacing(3),
        flex: '1 1 30%',
        minWidth: '200px',
        height: '100%',
        overflow: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    rightSection: {
        flex: '1 1 70%',
        minWidth: '400px',
        height: '100%',
        marginLeft: theme.spacing(2),
        borderLeft: `1px solid ${theme.palette.divider}`,
    },
    chatItem: {
        marginTop: theme.spacing(2),
    },
    presetList: {
        display: 'flex',
        flexWrap: 'wrap',
        marginRight: `-${theme.spacing(2)}`,
    },
    presetItem: {
        marginRight: theme.spacing(2),
        width: `calc(50% - ${theme.spacing(2)})`,
    },

    chatBot: {
        padding: `${theme.spacing(5)} ${theme.spacing(2)} ${theme.spacing(20)}`,
        height: '100%',
        overflow: 'hidden auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    messageItem: {
        display: 'flex',
    },
    messageItemRight: {
        display: 'flex',
        flexDirection: 'row-reverse',
    },
}))

export default function Loading() {
    const theme = useTheme()
    const { classes } = useStyles()
    const isWideScreen = useMediaQuery(theme.breakpoints.up('md'))
    return (
        <Container className={classes.pageContainer}>
            <div className={classes.leftSection}>
                <Typography variant="h5" mb={2} width="40%">
                    <Skeleton />
                </Typography>
                <Box overflow="hidden">
                    <Skeleton variant="rounded" height={84} className={classes.chatItem} />
                    <Skeleton variant="rounded" height={84} className={classes.chatItem} />
                    <Skeleton variant="rounded" height={50} className={classes.chatItem} />
                </Box>
                <div className={classes.presetContainer}>
                    <Typography variant="h5" mb={2} width="40%">
                        <Skeleton />
                    </Typography>
                    <Box overflow="hidden" className={classes.presetList}>
                        <Skeleton variant="rounded" height={152} className={classes.presetItem} />
                        <Skeleton variant="rounded" height={152} className={classes.presetItem} />
                    </Box>
                </div>
            </div>
            {isWideScreen && (
                <div className={classes.rightSection}>
                    <div className={classes.chatBot}>
                        <div className={classes.messageItem}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Box ml={2}>
                                <Skeleton variant="text" width={100} height={40} />
                            </Box>
                        </div>
                        <div className={classes.messageItemRight}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Box mr={2}>
                                <Skeleton variant="text" width={250} height={40} />
                            </Box>
                        </div>
                        <div className={classes.messageItem}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Box ml={2}>
                                <Skeleton variant="text" width={300} height={40} />
                            </Box>
                        </div>
                        <div className={classes.messageItemRight}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Box mr={2}>
                                <Skeleton variant="text" width={300} height={40} />
                                <Skeleton variant="text" width={300} height={40} />
                                <Skeleton variant="text" width={200} height={40} />
                            </Box>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    )
}
