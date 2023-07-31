import { Box, IconButton, Popover, Switch } from '@mui/material'
import { useState } from 'react'
import Settings from '@mui/icons-material/Settings'
import Public from '@mui/icons-material/Public'
import { useUser } from '../global/User'
import { makeStyles } from 'tss-react/mui'
import clsx from 'clsx'

interface ConfigPanelProps {
    className?: string
}

const useStyles = makeStyles()((theme) => ({
    configPanelBtn: {
        opacity: '.6',
        backgroundColor: theme.palette.background.paper,
        '&:hover, &:active': {
            opacity: '1',
        },
    },
    configPanel: {
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
}))

const ConfigPanel: React.FC<ConfigPanelProps> = ({ className }) => {
    const { user, action } = useUser() || {}
    const config = user?.config
    const { classes } = useStyles()

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const updateSerpEnabled = async (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        await action?.updateConfig({ serpEnabled: checked ? 1 : 0 })
    }

    return (
        <>
            <IconButton className={clsx(classes.configPanelBtn, className)} onClick={handleClick}>
                <Settings color="primary" />
            </IconButton>
            <Popover
                open={!!anchorEl}
                anchorEl={anchorEl}
                id="config-panel-btn"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                onClose={handleClose}
            >
                <Box className={classes.configPanel}>
                    <Public />
                    <Switch
                        checked={!!config?.serpEnabled}
                        onChange={updateSerpEnabled}
                        color="primary"
                        name="serpChecked"
                        inputProps={{ 'aria-label': 'serpEnabled checkbox' }}
                    />
                </Box>
            </Popover>
        </>
    )
}

export default ConfigPanel
