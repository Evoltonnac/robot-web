import { Preset } from '@/types/view/preset'
import { Dialog, Grid, Button, TextField, useMediaQuery, useTheme, Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { makeStyles } from 'tss-react/mui'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import TitleOutlined from '@mui/icons-material/TitleOutlined'

const schema = yup.object().shape({
    title: yup.string().max(8, '预设名太长').required('预设名不能为空'),
    prompt: yup.string().max(200, '提示词太长').required('提示词不能为空'),
})

const useStyles = makeStyles<{ fullScreen: boolean }>()((theme, { fullScreen }) => ({
    dialogContent: {
        position: 'relative',
        padding: theme.spacing(4),
        width: '500px',
        ...(fullScreen && {
            width: '100vw',
            height: '100vh',
            paddingBottom: `calc(env(safe-area-inset-bottom) + ${theme.spacing(4)})` /* 兼容 iOS >= 11.2 */,
        }),
    },
    label: {
        marginTop: '14px',
    },
    textField: {
        width: '80%',
    },
    buttonsField: {
        ...(fullScreen && {
            position: 'absolute',
            bottom: `calc(env(safe-area-inset-bottom) + ${theme.spacing(4)})` /* 兼容 iOS >= 11.2 */,
            left: 0,
            width: '100%',
        }),
    },
}))

interface PresetEditorProps {
    open: boolean
    preset?: Preset
    onSubmit: (formData: Partial<Preset>) => void
    onClose?: () => void
}

export const PresetEditor: React.FC<PresetEditorProps> = ({ open, preset, onSubmit, onClose }) => {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const { classes } = useStyles({ fullScreen })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        if (open) {
            const { title, prompt } = preset || {}
            reset({ title, prompt })
        }
    }, [open])

    const handleClose = () => {
        onClose && onClose()
    }

    const onSubmitHandler = async (data: Partial<Preset>) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
            setIsSubmitting(false)
        } catch {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} fullScreen={fullScreen} onClose={handleClose}>
            <Box className={classes.dialogContent} component="form" onSubmit={handleSubmit(onSubmitHandler)}>
                <Typography variant="h5" align="center">
                    {preset ? '修改预设' : '创建预设'}
                </Typography>
                <Typography variant="subtitle1" align="center" mb={4}>
                    通过提示词，定制化你的ai助手
                </Typography>
                <Grid container spacing={2} justifyContent="center" mb={2}>
                    <Grid item>
                        <TitleOutlined className={classes.label} />
                    </Grid>
                    <Grid item className={classes.textField}>
                        <TextField
                            {...register('title')}
                            id="title-input"
                            fullWidth
                            label="预设名"
                            error={!!errors.title?.message}
                            helperText={errors.title?.message}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} justifyContent="center" mb={2}>
                    <Grid item>
                        <DescriptionOutlined className={classes.label} />
                    </Grid>
                    <Grid item className={classes.textField}>
                        <TextField
                            {...register('prompt')}
                            id="prompt-textarea"
                            fullWidth
                            label="提示词"
                            placeholder="请输入提示词，比如ai的个性、语气等，尽情定制你的ai助手吧"
                            multiline
                            minRows={4}
                            maxRows={8}
                            error={!!errors.prompt?.message}
                            helperText={errors.prompt?.message}
                        />
                    </Grid>
                </Grid>
                <Grid container className={classes.buttonsField} spacing={2} justifyContent="center">
                    <Grid item>
                        <Button onClick={handleClose}>取消</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" type="submit" disabled={isSubmitting}>
                            完成
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Dialog>
    )
}
