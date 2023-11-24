import { Avatar, Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import { Preset } from '@/types/view/preset'
import { useRef, useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import { makeStyles } from 'tss-react/mui'
import { PresetEditor } from './PresetEditor'
import { ChatListItem } from '@/types/view/chat'
import { CSSObject } from 'tss-react/types'
import { RobotIcon } from '../common/Icons'
import { requestWithNotification } from '../global/RequestInterceptor'
import { useRouter } from 'next/navigation'

export const usePresetList = (presetList: Preset[]) => {
    const [list, setList] = useState<Preset[]>(presetList)
    const addPreset = (preset: Partial<Preset>) => {
        return requestWithNotification<Preset>(`/api/preset`, { method: 'POST', body: JSON.stringify(preset) }).then(({ data }) => {
            if (data) {
                setList(list.concat([data]))
                return data
            } else {
                return Promise.reject()
            }
        })
    }
    const updatePreset = (id: string, preset: Partial<Preset>) => {
        return requestWithNotification<Preset>(`/api/preset/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                ...preset,
            }),
        }).then(() => {
            const updatedIdx = list.findIndex(({ _id }) => _id === id)
            const newList = [...list]
            newList[updatedIdx] = { ...newList[updatedIdx], ...preset }
            setList(newList)
            return newList[updatedIdx]
        })
    }
    const deletePreset = (id: string) => {
        return requestWithNotification<Preset>(`/api/preset/${id}`, { method: 'DELETE' }).then(() => {
            const deletedIdx = list.findIndex(({ _id }) => _id === id)
            const newList = [...list]
            const deletedPreset = newList.splice(deletedIdx, 1)
            setList(newList)
            return deletedPreset[0]
        })
    }
    return {
        list,
        actions: {
            addPreset,
            updatePreset,
            deletePreset,
        },
    }
}

const useStyles = makeStyles()((theme) => {
    const presetItem: CSSObject = {
        height: '100%',
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        alignSelf: 'stretch',
        cursor: 'pointer',
    }
    return {
        presetItem,
        presetAvatar: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main,
        },
        presetActions: {
            flex: '0 0 auto',
            display: 'flex',
        },
        presetAddItem: {
            ...presetItem,
            minHeight: theme.spacing(16),
            border: '1px dashed',
            borderColor: theme.palette.primary.main,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
            opacity: 0.6,
            transition: 'all 0.2s',
            '&:hover, &:active': {
                opacity: 1,
            },
        },
    }
})

interface PresetListProps {
    list: Preset[]
    actions: {
        addPreset: (preset: Partial<Preset>) => Promise<Preset>
        updatePreset: (id: string, preset: Partial<Preset>) => Promise<Preset>
        deletePreset: (id: string) => Promise<Preset>
        addChat: (id?: string) => Promise<ChatListItem>
    }
    onNavigate?: (id: string) => void
    maxShow?: number
    gridSize?: number
}

export const PresetList: React.FC<PresetListProps> = ({ list, actions, onNavigate, maxShow = 4, gridSize }) => {
    const { classes } = useStyles()
    const router = useRouter()

    const curDeleting = useRef<string>('')
    // edit preset
    const [editPreset, setEditPreset] = useState<Preset>()
    const [isShowEditor, setIsShowEditor] = useState(false)

    const handleAddPreset = async () => {
        setEditPreset(undefined)
        setIsShowEditor(true)
    }
    const handleEditPreset = async (preset: Preset) => {
        setEditPreset(preset)
        setIsShowEditor(true)
    }

    const handleDeletePreset = async (id: string) => {
        if (curDeleting.current) {
            return
        }
        curDeleting.current = id
        try {
            await actions.deletePreset(id)
            curDeleting.current = ''
        } catch (e) {
            curDeleting.current = ''
        }
    }

    // submit preset info, include actions edit and create
    const submitPreset = async (preset: Partial<Preset>) => {
        if (editPreset) {
            await actions.updatePreset(editPreset._id, preset)
            setEditPreset(undefined)
            setIsShowEditor(false)
        } else {
            await actions.addPreset(preset)
            setIsShowEditor(false)
        }
    }

    const handleAddChatWithPreset = async (id: string) => {
        const newChat = await actions.addChat(id)
        setTimeout(() => {
            if (onNavigate) {
                onNavigate(newChat._id)
            } else {
                router.push(`/chat/${newChat._id}`)
            }
        }, 300)
    }

    // show first several presets
    const showList = list.slice(0, maxShow)
    // fill list with empty item if less than maxshow presets
    const emptyList: number[] = []
    showList.length < maxShow && emptyList.push(1)

    // responsive list
    const gridStyle = {
        xs: gridSize || 6,
        sm: gridSize || 4,
        md: gridSize || 3,
        lg: gridSize || 2,
    }

    return (
        <>
            <Grid container flexWrap="wrap" spacing={2}>
                {showList.map((preset) => (
                    <Grid item {...gridStyle} key={preset._id}>
                        <Paper
                            className={classes.presetItem}
                            elevation={0}
                            onClick={() => {
                                handleAddChatWithPreset(preset._id)
                            }}
                        >
                            <Avatar alt="bot avatar" src={preset.avatar} className={classes.presetAvatar}>
                                <RobotIcon />
                            </Avatar>
                            <Typography variant="body1" flex="1" noWrap={true} textAlign="center" width="100%">
                                {preset.title}
                            </Typography>
                            <Box className={classes.presetActions}>
                                <IconButton
                                    aria-label="edit"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditPreset(preset)
                                    }}
                                >
                                    <Edit />
                                </IconButton>
                                <IconButton
                                    aria-label="delete"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeletePreset(preset._id)
                                    }}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
                {emptyList.map((i, index) => (
                    <Grid item {...gridStyle} key={index}>
                        <Paper className={classes.presetAddItem} elevation={0} onClick={handleAddPreset}>
                            <Add></Add>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            <PresetEditor
                open={isShowEditor}
                preset={editPreset}
                onSubmit={submitPreset}
                onClose={() => {
                    setIsShowEditor(false)
                }}
            ></PresetEditor>
        </>
    )
}
