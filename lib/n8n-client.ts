import {
  ListingDeletePayload,
  ListingDetail,
  ListingDetailParams,
  ListingListFilters,
  ListingListResponse,
  ListingUpsertPayload,
  MyListingsParams
} from "../types/listing";
import { ENV_KEYS, getRequiredEnv } from "./env";
import { N8N_ACTIONS, N8N_QUERY_KEYS } from "./n8n-constants";

export class N8nApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "N8nApiError";
    this.status = status;
    this.details = details;
  }
}

export interface N8nClientConfig {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

type QueryValue = string | number | null | undefined;

type JsonHeaders = Record<string, string>;

const DEFAULT_HEADERS: JsonHeaders = {
  "Content-Type": "application/json"
};

const EMPTY_BODY_STATUS = 204;

function buildUrl(baseUrl: string, params: Record<string, QueryValue>): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

async function fetchJson<T>(
  fetcher: typeof fetch,
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetcher(input, init);
  if (!response.ok) {
    const details = await parseErrorBody(response);
    throw new N8nApiError("N8n request failed", response.status, details);
  }

  if (response.status === EMPTY_BODY_STATUS) {
    return null as T;
  }

  return (await response.json()) as T;
}

function resolveBaseUrl(config?: N8nClientConfig): string {
  if (config?.baseUrl) {
    return config.baseUrl;
  }
  return getRequiredEnv(ENV_KEYS.N8N_WEBHOOK_URL);
}

export function createN8nClient(config: N8nClientConfig = {}) {
  const fetcher = config.fetcher ?? fetch;
  const baseUrl = resolveBaseUrl(config);

  return {
    listListings(filters: ListingListFilters = {}) {
      const url = buildUrl(baseUrl, {
        [N8N_QUERY_KEYS.ACTION]: N8N_ACTIONS.LIST,
        [N8N_QUERY_KEYS.CITY]: filters.city,
        [N8N_QUERY_KEYS.DISTRICT]: filters.district,
        [N8N_QUERY_KEYS.TYPE]: filters.type,
        [N8N_QUERY_KEYS.PAGE]: filters.page,
        [N8N_QUERY_KEYS.LIMIT]: filters.limit,
        [N8N_QUERY_KEYS.PRICE_MIN]: filters.price_min,
        [N8N_QUERY_KEYS.PRICE_MAX]: filters.price_max,
        [N8N_QUERY_KEYS.ROOMS]: filters.rooms
      });
      return fetchJson<ListingListResponse>(fetcher, url);
    },
    getListingDetail(params: ListingDetailParams) {
      const url = buildUrl(baseUrl, {
        [N8N_QUERY_KEYS.ACTION]: N8N_ACTIONS.DETAIL,
        [N8N_QUERY_KEYS.SLUG]: params.slug
      });
      return fetchJson<ListingDetail>(fetcher, url);
    },
    getMyListings(params: MyListingsParams) {
      const url = buildUrl(baseUrl, {
        [N8N_QUERY_KEYS.ACTION]: N8N_ACTIONS.MY_LISTINGS,
        [N8N_QUERY_KEYS.INIT_DATA]: params.initData
      });
      return fetchJson<ListingListResponse>(fetcher, url);
    },
    upsertListing(payload: ListingUpsertPayload) {
      const url = buildUrl(baseUrl, {
        [N8N_QUERY_KEYS.ACTION]: N8N_ACTIONS.UPSERT
      });
      return fetchJson<ListingDetail>(fetcher, url, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload)
      });
    },
    deleteListing(payload: ListingDeletePayload) {
      const url = buildUrl(baseUrl, {
        [N8N_QUERY_KEYS.ACTION]: N8N_ACTIONS.DELETE
      });
      return fetchJson<{ ok: boolean }>(fetcher, url, {
        method: "POST",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(payload)
      });
    }
  };
}
