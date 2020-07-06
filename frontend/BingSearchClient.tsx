import { DefaultHttpClient, HttpOperationResponse, WebResourceLike } from "@azure/ms-rest-js";

const GLOBAL_ENDPOINT: string = "https://api.cognitive.microsoft.com/bing/v7.0/images/search";

export type SearchResult = {
  accentColor: string,
  contentSize: string,
  contentUrl: string,
  creativeCommons?: string,
  datePublished: string,
  encodingFormat: string,
  height: number,
  hostPageDisplayUrl: string,
  hostPageDomainFriendlyName: string,
  hostPageUrl: string,
  imageId: string,
  isFamilyFriendly: string,
  name: string,
  thumbnailUrl: string,
  webSearchUrl: string,
  width: number,
  thumbnail: {
    width: number,
    height: number,
  },
}
export type SearchResults = {
  currentOffset: number,
  nextOffset: number,
  totalEstimatedMatches: number,
  webSearchUrl: string,
  value: Array<SearchResult>,
}

export class BingSearchClient {
  private apiKey: string
  private endpoint?: string
  private clientId?: string

  constructor(apiKey: string, endpoint?: string, clientId?: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint || GLOBAL_ENDPOINT;
    this.clientId = clientId;
  }

  async search(q: string): Promise<SearchResults> {
    var queryurl = this.endpoint + "?q=" + encodeURIComponent(q) + "&count=150";
    const headers = {
      "Ocp-Apim-Subscription-Key": this.apiKey,
      "Accept": "application/json",
    }
    if (this.clientId) {
      headers["X-MSEdge-ClientID"] = this.clientId;
    }

    const response = await fetch(queryurl, {
      headers: headers,
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      credentials: 'same-origin',
      mode: 'cors',
    });

    return response.json();
  }
}
