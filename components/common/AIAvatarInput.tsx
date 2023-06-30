import { Avatar, Button, ClickAwayListener, Divider, Grid, TextField } from '@mui/material'
import { RobotIcon } from './Icons'
import { makeStyles } from 'tss-react/mui'
import { useEffect, useState } from 'react'
import { clientRequest } from '@/src/utils/request'

const useStyles = makeStyles<{ isShowPanel: boolean }>()((theme, { isShowPanel }) => ({
    container: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        backgroundColor: isShowPanel ? theme.palette.background.default : 'transparent',
        transition: 'background .5s ease',
        padding: isShowPanel ? `${theme.spacing(2)} ${theme.spacing(3)}` : 0,
        borderRadius: theme.shape.borderRadius,
    },
    avatar: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        backgroundColor: theme.palette.secondary.main,
    },
    avatarIcon: {
        fontSize: theme.spacing(4),
    },
    inputWrapper: {
        width: '100%',
        marginLeft: theme.spacing(2),
    },
    input: {
        fontSize: theme.typography.pxToRem(14),
    },
    endAdornmentButton: {
        minWidth: 0,
        flexShrink: 0,
        marginLeft: theme.spacing(1),
    },
}))

interface AIAvatarInputProps {
    id?: string
    value?: string
    onChange: (value: string) => void
    onFocus?: () => void
    onBlur?: () => void
}

export const AIAvatarInput: React.FC<AIAvatarInputProps> = ({ id, value, onChange, onFocus, onBlur }) => {
    const [imgValue, setImgValue] = useState<string>()
    const [prompt, setPrompt] = useState<string>('')
    const [isShowPanel, setIsShowPanel] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        if (value !== imgValue) {
            setImgValue(value || '')
        }
    }, [value])

    // change value
    const handleChangeImage = (val?: string) => {
        if (val) {
            setImgValue(val)
            onChange && onChange(val)
        }
    }

    // generate image
    const handleGenerateAvatar = async () => {
        if (!prompt || isGenerating) {
            return
        }
        setIsGenerating(true)
        clientRequest
            .post<{ url: string }>('api/pic/avatar', { prompt }, { timeout: 30000 })
            .then(({ url }) => {
                handleChangeImage(url)
            })
            .finally(() => {
                setIsGenerating(false)
            })
    }

    const { classes } = useStyles({ isShowPanel })
    return (
        <ClickAwayListener
            onClickAway={() => {
                onBlur && onBlur()
                setIsShowPanel(false)
            }}
        >
            <div id={id} className={classes.container}>
                <Avatar
                    alt="bot avatar"
                    src={imgValue}
                    onClick={() => {
                        setIsShowPanel(true)
                        onFocus && onFocus()
                    }}
                    className={classes.avatar}
                >
                    <RobotIcon className={classes.avatarIcon} />
                </Avatar>
                {isShowPanel ? (
                    <TextField
                        id="ai-avatar-prompt-input"
                        size="small"
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value)
                        }}
                        placeholder="输入描述文字"
                        className={classes.inputWrapper}
                        InputProps={{
                            classes: {
                                input: classes.input,
                            },
                            endAdornment: (
                                <>
                                    <Divider orientation="vertical" variant="middle" flexItem></Divider>
                                    <Button
                                        className={classes.endAdornmentButton}
                                        size="small"
                                        disabled={!prompt || isGenerating}
                                        onClick={handleGenerateAvatar}
                                    >
                                        生成{isGenerating ? '中' : ''}
                                    </Button>
                                </>
                            ),
                        }}
                    />
                ) : null}
            </div>
        </ClickAwayListener>
    )
}
