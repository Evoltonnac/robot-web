import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import { Preset } from '@/types/view/preset'
import Router from 'next/router'
import { clientRequest } from '@/src/utils/request'
import { useRef, useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import { makeStyles } from 'tss-react/mui'
import { PresetEditor } from './PresetEditor'
import { ChatListItem } from '@/types/view/chat'

export const usePresetList = (presetList: Preset[]) => {
    const [list, setList] = useState<Preset[]>(presetList)
    const addPreset = (preset: Partial<Preset>) => {
        return clientRequest.post<Preset>('/api/preset', { ...preset }).then((data) => {
            setList(list.concat([data]))
            return data
        })
    }
    const updatePreset = (id: string, preset: Partial<Preset>) => {
        return clientRequest
            .patch<Preset>(`/api/preset/${id}`, {
                ...preset,
            })
            .then(() => {
                const updatedIdx = list.findIndex(({ _id }) => _id === id)
                const newList = [...list]
                newList[updatedIdx] = { ...newList[updatedIdx], ...preset }
                setList(newList)
                return newList[updatedIdx]
            })
    }
    const deletePreset = (id: string) => {
        return clientRequest.delete<Preset>(`/api/preset/${id}`).then(() => {
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
    const presetItem = {
        height: '100px',
        padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
    return {
        presetItem,
        presetActions: {
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
        },
        presetAddItem: {
            ...presetItem,
            border: '2px dashed',
            borderColor: theme.palette.primary.main,
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
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
    onAttachPreset?: (id: string) => void
    onDestroyPreset?: (id: string) => void
}

export const PresetList: React.FC<PresetListProps> = ({ list, actions }) => {
    const { classes } = useStyles()

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
            Router.push(`/chat/${newChat._id}`)
        }, 300)
    }

    // show first 4 presets
    const showList = list.slice(0, 3)
    // fill list with empty item if less than 4 presets
    const emptyList: number[] = []
    for (let i = 0; i < 4 - showList.length; i++) {
        emptyList.push(i)
    }

    return (
        <>
            <Typography variant="h5" mb={2}>
                我的预设
            </Typography>
            <Grid container flexWrap="wrap" spacing={2}>
                {showList.map((preset) => (
                    <Grid item xs={6} key={preset._id}>
                        <Paper
                            className={classes.presetItem}
                            elevation={0}
                            onClick={() => {
                                handleAddChatWithPreset(preset._id)
                            }}
                        >
                            <Typography variant="body1" flex="1">
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
                    <Grid item xs={6} key={index}>
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
