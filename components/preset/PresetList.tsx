import { Grid } from '@mui/material'
import { Preset, PresetListItem } from '@/types/view/preset'
import Router from 'next/router'
import { clientRequest } from '@/src/utils/request'
import { useRef, useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import { makeStyles } from 'tss-react/mui'

export const usePresetList = (presetList: PresetListItem[]) => {
    const [list, setList] = useState<PresetListItem[]>(presetList)
    const addPreset = () => {
        return clientRequest.post<Preset>('/api/preset').then((data) => {
            setList(list.concat([data]))
            return data
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
            deletePreset,
        },
    }
}

const useStyles = makeStyles()((theme) => ({
    presetItem: {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        '& + &': {
            marginTop: theme.spacing(2),
        },
    },
}))

interface PresetListProps {
    list: PresetListItem[]
    actions: {
        addPreset: () => Promise<PresetListItem>
        deletePreset: (id: string) => Promise<PresetListItem>
    }
    onAttachPreset?: (id: string) => void
    onDestroyPreset?: (id: string) => void
}

export const PresetList: React.FC<PresetListProps> = ({ list, actions }) => {
    const { classes } = useStyles()
    const curDeleting = useRef<string>('')

    const handleGoPreset = (id: string) => {
        curDeleting.current !== id && Router.push(`/preset/${id}`)
    }

    const handleAddPreset = async () => {
        const newPreset = await actions.addPreset()
        setTimeout(() => {
            handleGoPreset(newPreset._id)
        }, 300)
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

    const showList = list.slice(0, 3)
    const emptyList: number[] = []
    for (let i = 0; i++; i < 4 - showList.length) {
        emptyList.push(i)
    }

    return (
        <Grid container flexWrap="wrap" spacing={2}>
            {showList.map((preset) => (
                <Grid item xs={6} key={preset._id}>
                    <div>{preset.title}</div>
                </Grid>
            ))}
            {emptyList.map((i, index) => (
                <Grid item xs={6} key={index}>
                    <div key={index}>
                        <Add></Add>
                    </div>
                </Grid>
            ))}
        </Grid>
    )
}
