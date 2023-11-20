import { Headers, RequestTool } from 'langchain/dist/tools/requests'
import { Tool } from 'langchain/tools'

/**
 * Class for making POST requests. Extends the Tool class and implements
 * the RequestTool interface. The input should be a JSON string with two
 * keys: 'url', 'data' and 'contenttype. The output will be the text response of the
 * POST request.
 */
export class RequestsPostTool extends Tool implements RequestTool {
    static lc_name() {
        return 'RequestsPostTool'
    }

    name = 'requests_post'

    maxOutputLength = Infinity

    constructor(public headers: Headers = {}, { maxOutputLength }: { maxOutputLength?: number } = {}) {
        // eslint-disable-next-line prefer-rest-params
        super(...arguments)

        this.maxOutputLength = maxOutputLength ?? this.maxOutputLength
    }

    /** @ignore */
    async _call(input: string) {
        try {
            const { url, data, contenttype } = JSON.parse(input)
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    ...(contenttype && { 'Content-Type': contenttype }),
                },
                body: JSON.stringify(data),
            })
            const text = await res.text()
            return text.slice(0, this.maxOutputLength)
        } catch (error) {
            return `${error}`
        }
    }

    description = `Use this when you want to POST to a website.
    Input should be a json string with three keys: "url", "data" and "contenttype".
    The value of "url" should be a string, and the value of "data" should be a dictionary of
    key-value pairs you want to POST to the url as a JSON body, the value of "contenttype"
    should be a valid Content-Type header value like "application/json".
    Be careful to always use double quotes for strings in the json string
    The output will be the text response of the POST request.`
}
