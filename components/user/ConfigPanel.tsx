import { Box, IconButton, Popover, Switch } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import Settings from '@mui/icons-material/Settings'
import Public from '@mui/icons-material/Public'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useUser } from '../global/User'
import { makeStyles } from 'tss-react/mui'
import clsx from 'clsx'
import { linearHexColor } from '@/src/utils/calculator'
import TemperatureSlider from '../common/TemperatureSlider'
import { blue, red } from '@mui/material/colors'
import { UserConfig } from '@/types/model/user'
import { debounce } from 'lodash'

interface ConfigPanelProps {
    className?: string
}

const useStyles = makeStyles()((theme) => ({
    configPanelBtn: {
        opacity: '.6',
        backgroundColor: theme.palette.background.paper,
        transition: 'all 0.2s',
        '&:hover, &:active': {
            opacity: '1',
        },
    },
    configPanel: {
        padding: theme.spacing(1),
    },
    configField: {
        display: 'flex',
        alignItems: 'center',
    },
    slider: {
        width: '100px',
        display: 'block',
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

    const [userConfig, setUserConfig] = useState<Pick<UserConfig, 'serpEnabled' | 'temperature'>>({ serpEnabled: 0, temperature: 0 })

    useEffect(() => {
        config && setUserConfig(config)
    }, [config])

    // debounce update
    const updateConfig = useRef(debounce((config) => action?.updateConfig(config), 500, { leading: false }))

    const updateSerpEnabled = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const serpEnabled = checked ? 1 : 0
        setUserConfig((state) => ({ ...state, serpEnabled }))
        updateConfig.current({ ...userConfig, serpEnabled })
    }
    const updateTemperature = (value: number) => {
        setUserConfig((state) => ({ ...state, temperature: value }))
        updateConfig.current({ ...userConfig, temperature: value })
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
                    <Box className={classes.configField}>
                        <Public color={!!userConfig?.serpEnabled ? 'primary' : 'inherit'} />
                        <Switch
                            checked={!!userConfig?.serpEnabled}
                            onChange={updateSerpEnabled}
                            color="primary"
                            name="serpChecked"
                            inputProps={{ 'aria-label': 'serpEnabled checkbox' }}
                        />
                    </Box>
                    <Box className={classes.configField}>
                        <LocalFireDepartmentIcon htmlColor={linearHexColor(blue[300], red[300], (userConfig?.temperature || 0) / 2)} />
                        <Box px={1.5}>
                            <TemperatureSlider
                                className={classes.slider}
                                value={userConfig?.temperature}
                                onChange={(_, val) => updateTemperature(Array.isArray(val) ? val[0] : val)}
                                min={0}
                                max={2}
                                step={0.1}
                                valueLabelDisplay="auto"
                            />
                        </Box>
                    </Box>
                </Box>
            </Popover>
        </>
    )
}

export default ConfigPanel
