import {
  useGlobalConfig,
} from '@airtable/blocks/ui';
export const BING_API_KEY = "bingApiKey";

export const FIXED_THUMBNAIL_HEIGHT = 150;
export const FIXED_THUMBNAIL_WIDTH = 150;

export function thumbnailUrlFor(pic) {
  return pic.thumbnailUrl + "&c=7&h=" + FIXED_THUMBNAIL_HEIGHT + "&w=" + FIXED_THUMBNAIL_WIDTH + "&dpr=2";
}


export function useSettings() {
  const globalConfig = useGlobalConfig();

  const apiKey = globalConfig.get(BING_API_KEY) as string;
  const settings = {
    apiKey,
  };

  if (!apiKey || apiKey === "") {
    return {
      isValid: false,
      message: 'Enter an API Key to use with Bing Image Search API',
      settings,
    };
  }
  return {
    isValid: true,
    settings,
  };
}
