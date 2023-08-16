import { Preset } from '@/types/view/preset'
import { Dialog, Grid, Button, TextField, useMediaQuery, Box, Typography, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { makeStyles } from 'tss-react/mui'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import TitleOutlined from '@mui/icons-material/TitleOutlined'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { AIAvatarInput } from '../common/AIAvatarInput'
import _ from 'lodash'
import { upload } from '@/src/utils/upload'
import TemperatureSlider from '../common/TemperatureSlider'

const schema = yup.object().shape({
    avatar: yup.string(),
    title: yup.string().max(10, '预设名太长').required('预设名不能为空'),
    prompt: yup.string().max(20000, '提示词太长').required('提示词不能为空'),
    temperature: yup.number(),
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
    inputField: {
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
    temperatureSlider: {
        width: 'calc( 100% - 30px )',
        margin: '7px 15px 15px',
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
        control,
    } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        if (open) {
            const { avatar, title, prompt, temperature = 0 } = preset || {}
            reset({ avatar, title, prompt, temperature })
        }
    }, [open])

    const handleClose = () => {
        onClose && onClose()
    }

    const onSubmitHandler = async (data: Partial<Preset>) => {
        setIsSubmitting(true)
        // get changed form fields
        let changedFields = Object.keys(data) as Array<keyof Preset>
        preset && (changedFields = changedFields.filter((key) => data[key] !== preset[key]))
        const newPreset = _.pick(data, changedFields)
        // if preset is specefied, add _id to data
        if (preset) {
            newPreset._id = preset._id
        }
        try {
            // upload file before submit
            if (newPreset.avatar) {
                newPreset.avatar = await upload(newPreset.avatar)
            }
            await onSubmit(newPreset)
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
                <Typography variant="subtitle1" align="center" mb={2}>
                    通过提示词，定制化你的ai助手
                </Typography>
                {/* avatar input section */}
                <Box mb={2}>
                    <Controller
                        control={control}
                        name="avatar"
                        render={({ field: { value, onChange, onBlur } }) => (
                            <AIAvatarInput id="avatar-input" {...{ value, onChange, onBlur }} />
                        )}
                    ></Controller>
                </Box>
                {/* title input section */}
                <Grid container spacing={2} justifyContent="center" mb={2}>
                    <Grid item>
                        <TitleOutlined className={classes.label} />
                    </Grid>
                    <Grid item className={classes.inputField}>
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
                {/* prompt input section */}
                <Grid container spacing={2} justifyContent="center" mb={2}>
                    <Grid item>
                        <DescriptionOutlined className={classes.label} />
                    </Grid>
                    <Grid item className={classes.inputField}>
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
                {/* temperature slider section */}
                <Grid container spacing={2} justifyContent="center" mb={2}>
                    <Grid item>
                        <Tooltip title="温度(决定AI回答的灵活程度)" arrow placement="bottom-start">
                            <LocalFireDepartmentIcon className={classes.label} />
                        </Tooltip>
                    </Grid>
                    <Grid item className={classes.inputField}>
                        <Controller
                            control={control}
                            name="temperature"
                            render={({ field: { value, onChange } }) => (
                                <TemperatureSlider
                                    value={value}
                                    onChange={(_, val) => onChange(Array.isArray(val) ? val[0] : val)}
                                    id="temperature-slider"
                                    className={classes.temperatureSlider}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                    valueLabelDisplay="auto"
                                />
                            )}
                        ></Controller>
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
