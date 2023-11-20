import { Tool } from 'langchain/tools'
import { buildUrl } from '../shared'
import { Plugins } from '@/types/server/langchain'

interface BaseParameters {
    timeout?: number
}

export class ImageSearch extends Tool {
    toJSON() {
        return this.toJSONNotImplemented()
    }

    protected params: BaseParameters

    protected baseUrl = 'https://imgser.aigenprompt.com/image'

    constructor(params: BaseParameters = {}) {
        super()

        this.params = params
    }

    name = Plugins.ImageSearch

    async _call(input: string) {
        const { timeout, ...params } = this.params
        const resp = await fetch(
            buildUrl(
                {
                    ...params,
                    query: input,
                },
                this.baseUrl
            ),
            {
                signal: timeout ? AbortSignal.timeout(timeout) : undefined,
            }
        )

        const res = await resp.json()

        if (res.error) {
            throw new Error(`Got error from ImageSearch: ${res.error}`)
        }

        let images = res.images
        if (Array.isArray(images) && images.length) {
            images = images
                .map((image) => {
                    const { title, url, download_url } = image
                    return { title, url, download_url }
                })
                .splice(0, 3)
            return `Found images about "${input}":\n${JSON.stringify(images)}`
        } else {
            return 'No good search result found'
        }
    }

    description = "A plugin that connects to the Unsplash API to find and display images based on user's query."
}
