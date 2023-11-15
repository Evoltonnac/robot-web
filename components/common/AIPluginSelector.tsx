import { Chip, MenuItem, Select, SelectChangeEvent, SelectProps } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { useEffect, useRef, useState } from 'react'
import { Tools } from '@/types/server/langchain'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import { SvgIconComponent } from '@mui/icons-material'
import clsx from 'clsx'
import { useUser } from '../global/User'
import { debounce } from 'lodash'

const useStyles = makeStyles()((theme) => ({
    selector: {
        width: '200px',
    },
    value: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
    },
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
]

export const AIPluginSelector: React.FC<SelectProps> = ({ children, className, ...props }) => {
    const { user, action } = useUser() || {}
    const config = user?.config
    const [plugins, setPlugins] = useState<Tools[]>([])

    useEffect(() => {
        config && setPlugins(config.activePlugins)
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
        return (
            <div className={classes.value}>
                {toolList.map((value) => {
                    const item = pluginMap.find((item) => item.value === value)!
                    return <Chip key={value} color="primary" size="small" label={item.label} icon={<item.icon />}></Chip>
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
