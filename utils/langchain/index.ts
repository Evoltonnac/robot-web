import { SerpAPIParameters, Tool } from 'langchain/tools'

type Language = 'zh-cn' | 'ja' | 'en'

export function checkLanguage(str: string): Language {
    if (/[\u4e00-\u9fa5]/.test(str)) {
        return 'zh-cn'
    } else if (/[\u0800-\u4e00]/.test(str)) {
        return 'ja'
    } else {
        return 'en'
    }
}

export const LANGUAGE_SERP_MAP: Record<Language, Partial<SerpAPIParameters>> = {
    'zh-cn': {
        gl: 'cn',
        hl: 'zh-cn',
    },
    ja: {
        gl: 'jp',
        hl: 'ja',
    },
    en: {
        hl: 'en',
    },
}

export function parseGoogleSearch(params: Partial<SerpAPIParameters>): string {
    const { q = '', gl = '', hl = '' } = params
    return `https://www.google.com/search?gl=${gl}&hl=${hl}&q=${encodeURIComponent(q)}&oq=${encodeURIComponent(q)}&lum_json=1`
}

// get active plugins list from string array
export function getPlugins(plugins: Tool[], activePlugins: string[]): Tool[] {
    return plugins.filter((plugin) => activePlugins.includes(plugin.name))
}
