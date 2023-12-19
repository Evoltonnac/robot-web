import { Tool } from 'langchain/tools'
import { Plugins } from '@/types/server/langchain'
import { getOpenai } from '../openai'

interface BaseParameters {
    timeout?: number
}

export class Dalle extends Tool {
    toJSON() {
        return this.toJSONNotImplemented()
    }

    protected params: BaseParameters

    constructor(params: BaseParameters = {}) {
        super()

        this.params = params
    }

    name = Plugins.ImageGenerator

    async _call(input: string) {
        const resp = await getOpenai().images.generate({
            model: 'dall-e-3',
            prompt: input,
            size: '1024x1024',
            quality: 'standard',
            n: 1,
        })

        return `Image generated: ${resp.data[0].url}`
    }

    description = 'A plugin to generate images. You can create an original image given a text prompt input.'
}
