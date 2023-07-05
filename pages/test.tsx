import { useEffect, useRef, useState } from 'react'

export default function StreamViewer() {
    const [streamText, setStreamText] = useState('')
    const abort = useRef<AbortController | null>(null)

    useEffect(() => {
        console.log('FIRING OFF STREAM REQUEST')
        abort.current = new AbortController()
        fetch('/api/test', {
            ...(abort.current && {
                signal: abort.current.signal,
            }),
        }).then(async (response) => {
            if (!response.body) {
                return
            }
            const reader = response.body.getReader()
            const Decoder = new TextDecoder()
            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    break
                }
                setStreamText((prev) => prev + `\n${Decoder.decode(value)}`)
                if (abort.current === null) {
                    console.log('cancel')
                    reader.cancel()
                    break
                }
            }
        })
    }, [])

    return (
        <div style={{ margin: '4rem' }}>
            <a href="/" style={{ fontSize: '16px', marginBottom: '20px', color: 'lightblue', textDecoration: 'underline' }}>
                To Fetch Demo 👉
            </a>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                Demo of Abort Signal not working with Edge (with EventSource)
            </h1>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                Open the console and click the button to see the abort signal not working.
            </p>
            <button
                style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    backgroundColor: '#007acc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    abort.current = null
                }}
            >
                Stop Stream
            </button>
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Streamed Text:</h2>
                <pre style={{ fontSize: '14px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{streamText}</pre>
            </div>
        </div>
    )
}
