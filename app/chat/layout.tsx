import { FCProps } from '@/types/view/common'
import { Metadata } from 'next/types'

export const metadata: Metadata = {
    title: 'Robot Web AI / All Chat',
}

const ChatLayout: React.FC<FCProps> = ({ children }) => children
export default ChatLayout
