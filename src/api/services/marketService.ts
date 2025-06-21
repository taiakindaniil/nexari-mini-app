import apiClient from '../apiClient';

export interface MarketListing {
  id: number;
  seller_id: number;
  seller_name: string;
  character: {
    id: number;
    name: string;
    image_url: string;
    level: number;
    rarity: string;
    income_rate: number;
  };
  price: number;
  created_at: string;
}

export interface CreateListingRequest {
  user_character_id: number;
  price: number;
}

export interface CreateListingResponse {
  success: boolean;
  error?: string;
  listing?: {
    id: number;
    character_name: string;
    character_level: number;
    price: number;
    created_at: string;
  };
}

export interface PurchaseRequest {
  listing_id: number;
}

export interface PurchaseResponse {
  success: boolean;
  error?: string;
  transaction?: {
    id: number;
    character_name: string;
    character_level: number;
    price: number;
    commission: number;
    seller_payout: number;
  };
  buyer_remaining_balance?: number;
}

export interface UserListing {
  id: number;
  character: {
    name: string;
    image_url: string;
    level: number;
    rarity: string;
  };
  price: number;
  created_at: string;
}

export interface MarketStats {
  active_listings: number;
  total_transactions: number;
}

/**
 * Service for handling market-related API calls
 */
class MarketService {
  /**
   * Get market listings with filters
   */
  async getListings(
    characterFilter?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = 'newest',
    limit: number = 50,
    offset: number = 0
  ): Promise<MarketListing[]> {
    const params: any = {
      sort_by: sortBy,
      limit,
      offset
    };
    
    if (characterFilter) params.character_filter = characterFilter;
    if (minPrice !== undefined) params.min_price = minPrice;
    if (maxPrice !== undefined) params.max_price = maxPrice;
    
    const response = await apiClient.get<MarketListing[]>('/market/listings', { params });
    return response.data;
  }

  /**
   * Create a new market listing
   */
  async createListing(request: CreateListingRequest): Promise<CreateListingResponse> {
    const response = await apiClient.post<CreateListingResponse>('/market/listings', request);
    return response.data;
  }

  /**
   * Purchase from market
   */
  async purchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    const response = await apiClient.post<PurchaseResponse>('/market/purchase', request);
    return response.data;
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId: number): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiClient.delete(`/market/listings/${listingId}`);
    return response.data;
  }

  /**
   * Get user's active listings
   */
  async getMyListings(): Promise<UserListing[]> {
    const response = await apiClient.get<UserListing[]>('/market/my-listings');
    return response.data;
  }

  /**
   * Get market statistics
   */
  async getStats(): Promise<MarketStats> {
    const response = await apiClient.get<MarketStats>('/market/stats');
    return response.data;
  }
}

export default new MarketService(); 