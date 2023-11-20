import { AIPluginTool, RequestsGetTool, SerpAPIParameters, Tool } from 'langchain/tools'
import { RequestsPostTool } from './RequestsPostTool'
import { Plugins, Tools, ToolsMap } from '@/types/server/langchain'

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
export function getPlugins(plugins: Tool[], activeTools: Tools[]): Tool[] {
    const enabledPlugins = activeTools.reduce((pre, cur) => {
        if (ToolsMap[cur]) {
            pre.push(...ToolsMap[cur])
            return pre
        }
        return pre
    }, [] as Plugins[])
    const activePlugins = plugins.filter((plugin) => enabledPlugins.includes(plugin.name as Plugins))
    if (activePlugins.some((plugin) => plugin instanceof AIPluginTool)) {
        activePlugins.unshift(new RequestsGetTool(), new RequestsPostTool())
    }
    return activePlugins
}
