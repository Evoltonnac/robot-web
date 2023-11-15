import { Tool } from 'langchain/tools'
import { buildUrl } from '../shared'
import { Tools } from '@/types/server/langchain'

interface BaseParameters {
    timeout?: number
}

export class Calculator extends Tool {
    protected params: BaseParameters

    protected baseUrl = 'https://calc.smoothplugins.com'

    constructor(params: BaseParameters = {}) {
        super()

        this.params = params
    }

    name = Tools.Calculator

    async _call(input: string) {
        const { timeout, ...params } = this.params
        const resp = await fetch(
            buildUrl(
                {
                    ...params,
                    formula: input,
                },
                this.baseUrl
            ),
            {
                signal: timeout ? AbortSignal.timeout(timeout) : undefined,
            }
        )

        const res = await resp.json()

        if (resp.status === 200 && res.result) {
            return '' + res.result
        }
        return "I don't know how to do that."
    }

    description = `Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.`
}
