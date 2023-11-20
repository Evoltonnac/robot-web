import { Chip, MenuItem, Select, SelectChangeEvent, SelectProps } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useEffect, useRef, useState } from 'react'
import { Tools } from '@/types/server/langchain'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import GifBoxIcon from '@mui/icons-material/GifBox'
import TravelExplore from '@mui/icons-material/TravelExplore'
import { SvgIconComponent } from '@mui/icons-material'
import clsx from 'clsx'
import { useUser } from '../global/User'
import { debounce } from 'lodash'

type nestClasses = 'chipIcon' | 'chipIconNoLabel'
const useStyles = makeStyles<void, nestClasses>()((theme, _params, classes) => ({
    selector: {
        width: '200px',
    },
    value: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    chip: {
        marginRight: theme.spacing(1),
        [`& .${classes.chipIcon}`]: {
            marginLeft: theme.spacing(1),
        },
        [`& .${classes.chipIconNoLabel}`]: {
            marginLeft: theme.spacing(1.5),
        },
    },
    chipIcon: {},
    chipIconNoLabel: {},
    placeholder: {
        color: theme.palette.text.disabled,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
    itemIcon: {
        marginRight: theme.spacing(1),
    },
}))

const pluginMap: Array<{
    label: string
    icon: SvgIconComponent
    value: Tools
}> = [
    {
        label: '图片搜索',
        icon: ImageSearchIcon,
        value: Tools.ImageSearch,
    },
    {
        label: 'GIF搜索',
        icon: GifBoxIcon,
        value: Tools.GifSearch,
    },
    {
        label: '检索增强',
        icon: TravelExplore,
        value: Tools.SearchEnhance,
    },
]

export const AIPluginSelector: React.FC<SelectProps> = ({ children, className, ...props }) => {
    const { user, action } = useUser() || {}
    const config = user?.config
    const [plugins, setPlugins] = useState<Tools[]>([])

    useEffect(() => {
        config && setPlugins(config.activePlugins.filter((val) => pluginMap.some((item) => item.value === val)))
    }, [config])

    // TODO: refactor debounce action to global context
    // debounce update
    const updateConfig = useRef(debounce((config) => action?.updateConfig(config), 500, { leading: false }))

    const handleChange = (event: SelectChangeEvent<unknown>) => {
        const value = event.target.value as Tools[]
        setPlugins(value || [])
        updateConfig.current({ activePlugins: value || [] })
    }

    const { classes } = useStyles()

    // render selector value
    const renderValue = (selected: unknown) => {
        const toolList = selected as Tools[]
        if (toolList.length === 0) {
            return <span className={classes.placeholder}>选择插件</span>
        }
        const isShowLabel = toolList.length < 3
        return (
            <div className={classes.value}>
                {toolList.map((value) => {
                    const item = pluginMap.find((item) => item.value === value)!
                    return (
                        <Chip
                            key={value}
                            color="primary"
                            size="small"
                            className={classes.chip}
                            classes={{
                                icon: isShowLabel ? classes.chipIcon : classes.chipIconNoLabel,
                            }}
                            label={isShowLabel ? item.label : null}
                            icon={<item.icon />}
                        ></Chip>
                    )
                })}
            </div>
        )
    }

    return (
        <Select
            id="ai_plugin_selector"
            multiple
            size="small"
            className={clsx(classes.selector, className)}
            value={plugins}
            onChange={handleChange}
            displayEmpty={true}
            renderValue={renderValue}
            {...props}
        >
            {pluginMap.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                    <div className={classes.item}>
                        <item.icon className={classes.itemIcon} />
                        {item.label}
                    </div>
                </MenuItem>
            ))}
        </Select>
    )
}
