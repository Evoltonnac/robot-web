// plugin names
export enum Plugins {
    ImageSearch = 'image_search',
    Calculator = 'calculator',
    BrowserPilot = 'web_browser',
    SerpAPITool = 'search',
    Wikipedia = 'wikipedia_api',
    GifSearch = 'gif_search',
    ImageGenerator = 'image_generator',
}

// tool names, a tool is a set of plugins
export enum Tools {
    ImageSearch = Plugins.ImageSearch,
    GifSearch = Plugins.GifSearch,
    ImageGenerator = Plugins.ImageGenerator,
    SearchEnhance = 'search_enhance',
}

// tool-plugins map
export const ToolsMap: Record<Tools, Plugins[]> = {
    [Tools.ImageSearch]: [Plugins.ImageSearch],
    [Tools.GifSearch]: [Plugins.GifSearch],
    [Tools.SearchEnhance]: [Plugins.BrowserPilot, Plugins.Wikipedia],
    [Tools.ImageGenerator]: [Plugins.ImageGenerator],
}

export type LangChainMessage =
    | {
          type: 'text'
          text: string
      }
    | {
          type: 'image_url'
          image_url:
              | string
              | {
                    url: string
                    detail?: 'auto' | 'low' | 'high'
                }
      }
