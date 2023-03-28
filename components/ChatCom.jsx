import Chat, { Bubble, useMessages } from '@chatui/core'
export default function ChatCom() {
    const { messages, appendMsg, setTyping } = useMessages([])

    function handleSend(type, val) {
        if (type === 'text' && val.trim()) {
            appendMsg({
                type: 'text',
                content: { text: val },
                position: 'right',
            })

            setTyping(true)

            setTimeout(() => {
                appendMsg({
                    type: 'text',
                    content: { text: 'Bala bala' },
                })
            }, 1000)
        }
    }

    function renderMessageContent(msg) {
        const { content } = msg
        return <Bubble content={content.text} />
    }

    return (
        <Chat
            navbar={{ title: '智能助理' }}
            messages={messages}
            renderMessageContent={renderMessageContent}
            onSend={handleSend}
        />
    )
}