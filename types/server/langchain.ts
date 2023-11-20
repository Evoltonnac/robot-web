// plugin names
export enum Plugins {
    ImageSearch = 'image_search',
    Calculator = 'calculator',
    BrowserPilot = 'web_browser',
    SerpAPITool = 'search',
    Wikipedia = 'wikipedia_api',
    GifSearch = 'gif_search',
}

// tool names, a tool is a set of plugins
export enum Tools {
    ImageSearch = Plugins.ImageSearch,
    GifSearch = Plugins.GifSearch,
    SearchEnhance = 'search_enhance',
}

// tool-plugins map
export const ToolsMap: Record<Tools, Plugins[]> = {
    [Tools.ImageSearch]: [Plugins.ImageSearch],
    [Tools.GifSearch]: [Plugins.GifSearch],
    [Tools.SearchEnhance]: [Plugins.BrowserPilot, Plugins.Wikipedia],
}
