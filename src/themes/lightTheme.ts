import { createTheme } from '@mui/material/styles'
import { blueGrey } from '@mui/material/colors'

// Create a theme instance.
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#556cd6',
        },
        secondary: {
            main: '#19857b',
        },
        error: {
            main: '#e57373',
        },
        background: {
            default: blueGrey[50],
        },
    },
    shape: {
        borderRadius: 8,
    },
})

export default theme
