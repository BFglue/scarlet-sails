export type Currency = "RUB";

export interface Listing {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: Currency;
  city: string;
  district: string;
  address: string;
  rooms: number | null;
  area: number | null;
  floor: number | null;
  total_floors: number | null;
  description: string;
  images: string[];
  agent_name: string;
  agent_phone: string;
  created_at: string;
  updated_at: string;
  owner_telegram_user_id: string;
}

export type ListingSummary = Listing;
export type ListingDetail = Listing;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ListingListResponse {
  items: ListingSummary[];
  pagination: Pagination;
}

export interface ListingListFilters {
  city?: string;
  district?: string;
  type?: string;
  page?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  rooms?: number;
}

export interface ListingDetailParams {
  slug: string;
}

export interface MyListingsParams {
  initData: string;
}

export interface ListingUpsertPayload {
  initData: string;
  listing: Listing;
}

export interface ListingDeletePayload {
  initData: string;
  id: string;
}
