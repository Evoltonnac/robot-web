/**
 * @file temperature styled slider
 */
import React from 'react'
import { Slider, SliderProps } from '@mui/material'
import { withStyles } from 'tss-react/mui'
import { blue, red } from '@mui/material/colors'
import { linearHexColor } from '@/src/utils/calculator'

const MySlider = withStyles(Slider, (theme, { value, max = 100, min = 0 }) => {
    const v = Array.isArray(value) ? (value[0] + value[1]) / 2 : value || 0
    const percent = (v - min) / max
    const startColor = blue[300]
    const endColor = red[300]
    const currentColor = linearHexColor(startColor, endColor, percent)
    return {
        root: {
            color: theme.palette.background.paper,
            height: 12,
        },
        thumb: {
            backgroundColor: currentColor,
        },
        active: {},
        track: {
            height: 12,
            borderRadius: 6,
            background: `linear-gradient(90deg, ${startColor} 0%, ${currentColor} 100%)`,
        },
        rail: {
            height: 12,
            borderRadius: 6,
            background: currentColor,
        },
    }
})

const TemperatureSlider: React.FC<SliderProps> = (props) => {
    return React.createElement(MySlider, {
        ...props,
    })
}

export default TemperatureSlider
