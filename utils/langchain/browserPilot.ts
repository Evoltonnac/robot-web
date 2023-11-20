import { Tool } from 'langchain/tools'
import { Plugins } from '@/types/server/langchain'

interface BaseParameters {
    timeout?: number
}

export class BrowserPilot extends Tool {
    static lc_name() {
        return 'BrowserPilot'
    }

    toJSON() {
        return this.toJSONNotImplemented()
    }

    protected params: BaseParameters

    protected baseUrl = 'https://browserplugin.feednews.com/openapi/browser/transcoder'

    constructor(params: BaseParameters = {}) {
        super()

        this.params = params
    }

    name = Plugins.BrowserPilot

    async _call(input: string) {
        if (!/^https?:\/\//.test(input)) {
            return 'The input is not a valid http URL including protocol'
        }
        const { timeout } = this.params
        const resp = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                link: input,
            }),
            signal: timeout ? AbortSignal.timeout(timeout) : undefined,
        })

        const res = await resp.json()

        if (+res.code === 0 && res.result?.content) {
            return (
                `Text: ${res.result.content}\n\n` +
                `Link: ${input}\n\n` +
                `Assistant should give a short summary from the above text or use as needed. If necessary, the link should be embedded in the result text using Markdown's reference-style link syntax.`
            )
        }
        return 'The input is not a valid http URL including protocol'
    }

    description = `useful for when you need to summarize a webpage. input should be a valid http URL including protocol.`
}
