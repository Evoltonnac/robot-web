import { Tool } from 'langchain/tools'

/**
 * This does not use the `serpapi` package because it appears to cause issues
 * when used in `jest` tests. Part of the issue seems to be that the `serpapi`
 * package imports a wasm module to use instead of native `fetch`, which we
 * don't want anyway.
 *
 * NOTE: you must provide location, gl and hl or your region and language will
 * may not match your location, and will not be deterministic.
 */

// Copied over from `serpapi` package
interface BaseParameters {
    /**
     * Parameter defines the device to use to get the results. It can be set to
     * `desktop` (default) to use a regular browser, `tablet` to use a tablet browser
     * (currently using iPads), or `mobile` to use a mobile browser (currently
     * using iPhones).
     */
    device?: 'desktop' | 'tablet' | 'mobile'
    /**
     * Parameter will force SerpApi to fetch the Google results even if a cached
     * version is already present. A cache is served only if the query and all
     * parameters are exactly the same. Cache expires after 1h. Cached searches
     * are free, and are not counted towards your searches per month. It can be set
     * to `false` (default) to allow results from the cache, or `true` to disallow
     * results from the cache. `no_cache` and `async` parameters should not be used together.
     */
    no_cache?: boolean
    /**
     * Specify the client-side timeout of the request. In milliseconds.
     */
    timeout?: number
}

export interface SerpAPIParameters extends BaseParameters {
    /**
     * Search Query
     * Parameter defines the query you want to search. You can use anything that you
     * would use in a regular Google search. e.g. `inurl:`, `site:`, `intitle:`. We
     * also support advanced search query parameters such as as_dt and as_eq. See the
     * [full list](https://serpapi.com/advanced-google-query-parameters) of supported
     * advanced search query parameters.
     */
    q: string
    /**
     * Country
     * Parameter defines the country to use for the Google search. It's a two-letter
     * country code. (e.g., `us` for the United States, `uk` for United Kingdom, or
     * `fr` for France). Head to the [Google countries
     * page](https://serpapi.com/google-countries) for a full list of supported Google
     * countries.
     */
    gl?: string
    /**
     * Language
     * Parameter defines the language to use for the Google search. It's a two-letter
     * language code. (e.g., `en` for English, `es` for Spanish, or `fr` for French).
     * Head to the [Google languages page](https://serpapi.com/google-languages) for a
     * full list of supported Google languages.
     */
    hl?: string
}

type UrlParameters = Record<string, string | number | boolean | undefined | null>

export class SerpAPITool extends Tool {
    toJSON() {
        return this.toJSONNotImplemented()
    }

    protected params: Partial<SerpAPIParameters>

    protected baseUrl: string

    protected init: RequestInit | null | undefined

    constructor(params: Partial<SerpAPIParameters> = {}, baseUrl = '', init?: RequestInit) {
        super()

        this.params = params
        this.baseUrl = baseUrl
        this.init = init
    }

    name = 'search'

    protected buildUrl<P extends UrlParameters>(parameters: P, baseUrl: string): string {
        const nonUndefinedParams: [string, string][] = Object.entries(parameters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, `${value}`])
        const searchParams = new URLSearchParams(nonUndefinedParams)
        console.log(`${baseUrl}?${searchParams}`)
        return `${baseUrl}?${searchParams}`
    }

    protected parseOrganicResults(organic_results: any): string {
        const results: Array<{ r: number; d: string }> = []
        // get result and rank from one result object
        const parseSingleResult = (cur: any, idx: number) => {
            const { description, title, subresults, global_rank } = cur
            const rank = idx + 1
            if (description || title) {
                results.push({
                    r: global_rank || rank,
                    d: description || title,
                })
            }
        }
        if (organic_results.length) {
            const organicResults = organic_results as Array<any>
            // parse first layer of organic results
            organicResults.forEach((cur, idx) => {
                parseSingleResult(cur, idx)

                // parse subresults layer of organic results
                if (cur.subresults?.length) {
                    const subResults = cur.subresults as Array<any>
                    subResults.forEach((curSub, idxSub) => {
                        parseSingleResult(curSub, idxSub)
                    })
                }
            }, '')
            return results
                .sort(({ r: ra }, { r: rb }) => ra - rb)
                .reduce((pre, cur, idx) => {
                    return pre + `${pre ? '\n' : ''}${idx + 1}.${cur.d}`
                }, '')
        }
        return 'No good search result found'
    }

    /** @ignore */
    async _call(input: string) {
        const { timeout, ...params } = this.params
        const resp = await fetch(
            this.buildUrl(
                {
                    ...params,
                    q: input,
                },
                this.baseUrl
            ),
            {
                ...this.init,
                signal: timeout ? AbortSignal.timeout(timeout) : undefined,
            }
        )

        const res = await resp.json()

        if (res.errno !== '00000') {
            throw new Error(`Got error from serpAPI: ${res.errmsg}`)
        }

        const data = res.data
        if (data.answer_box?.answer) {
            return data.answer_box.answer
        }

        if (data.answer_box?.snippet) {
            return data.answer_box.snippet
        }

        if (data.answer_box?.snippet_highlighted_words) {
            return data.answer_box.snippet_highlighted_words[0]
        }

        if (data.sports_dataults?.game_spotlight) {
            return data.sports_dataults.game_spotlight
        }

        if (data.knowledge_graph?.description) {
            return data.knowledge_graph.description
        }

        if (data.organic?.length) {
            return this.parseOrganicResults(data.organic)
        }

        return 'No good search result found'
    }

    description = 'a search engine. useful for when you need to answer questions about current events. input should be a search query.'
}
