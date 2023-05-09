import { Roboto } from 'next/font/google'
import { createTheme } from '@mui/material/styles'
import { blueGrey } from '@mui/material/colors'

export const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Helvetica', 'Arial', 'sans-serif'],
})

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
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
})

export default theme
