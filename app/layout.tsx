import { FCProps } from '@/types/view/common'
import ThemeRegistry from './ThemeRegistry'
import { Metadata, Viewport } from 'next/types'

export const metadata: Metadata = {
    title: 'Robot Web AI',
}

export const viewport: Viewport = { width: '', initialScale: 1 }

const RootLayout: React.FC<FCProps> = (props) => {
    const { children } = props
    return (
        <html lang="en">
            <body>
                <ThemeRegistry>{children}</ThemeRegistry>
            </body>
        </html>
    )
}

export default RootLayout
