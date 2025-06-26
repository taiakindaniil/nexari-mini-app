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
  price_nanoton: number;
  price_ton: number;
  wallet_address: string;
  created_at: string;
}

export interface CreateListingRequest {
  user_character_id: number;
  price_nanoton: number;
}

export interface CreateListingResponse {
  success: boolean;
  error?: string;
  listing?: {
    id: number;
    character_name: string;
    character_level: number;
    price_nanoton: number;
    price_ton: number;
    wallet_address: string;
    created_at: string;
  };
}

export interface PurchaseRequest {
  listing_id: number;
}

export interface PurchaseResponse {
  success: boolean;
  error?: string;
  payment_required?: boolean;
  transaction_details?: {
    transaction_uuid: string;
    listing_id: number;
    character_name: string;
    character_level: number;
    price_nanoton: number;
    price_ton: number;
    commission_nanoton: number;
    commission_ton: number;
    seller_wallet: string;
    buyer_wallet: string;
    expires_at: string;
  };
}

export interface CompletePurchaseRequest {
  transaction_uuid: string;
  blockchain_hash: string;
}

export interface CompletePurchaseResponse {
  success: boolean;
  error?: string;
  transaction?: {
    id: number;
    uuid: string;
    character_name: string;
    character_level: number;
    price_nanoton: number;
    price_ton: number;
    commission_nanoton: number;
    commission_ton: number;
    blockchain_hash: string;
    confirmed_at: string;
  };
}

export interface UserListing {
  id: number;
  character: {
    name: string;
    image_url: string;
    level: number;
    rarity: string;
  };
  price_nanoton: number;
  price_ton: number;
  wallet_address: string;
  created_at: string;
}

export interface MarketStats {
  active_listings: number;
  total_transactions: number;
}

export interface MarketFilters {
  character_filter?: string;
  min_price_nanoton?: number;
  max_price_nanoton?: number;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'level_desc';
  limit?: number;
  offset?: number;
}

export interface TransactionStatusResponse {
  success: boolean;
  error?: string;
  transaction?: {
    uuid: string;
    status: string;
    listing_id: number;
    expires_at: string;
    time_remaining_seconds: number;
    character_name: string;
    price_ton: number;
    blockchain_hash?: string;
    confirmed_at?: string;
  };
}

export interface CleanupResponse {
  success: boolean;
  error?: string;
  expired_count: number;
  message?: string;
}

/**
 * Service for handling market-related API calls
 */
class MarketService {
  /**
   * Create a new market listing
   * @param request - Listing creation request
   * @returns Promise with creation result
   */
  async createListing(request: CreateListingRequest): Promise<CreateListingResponse> {
    const { data } = await apiClient.post<CreateListingResponse>('/market/listings', request);
    return data;
  }

  /**
   * Get market listings with optional filters
   * @param filters - Optional filters for listings
   * @returns Promise with array of listings
   */
  async getMarketListings(filters: MarketFilters = {}): Promise<MarketListing[]> {
    const params = new URLSearchParams();
    
    if (filters.character_filter) params.append('character_filter', filters.character_filter);
    if (filters.min_price_nanoton !== undefined) params.append('min_price_nanoton', filters.min_price_nanoton.toString());
    if (filters.max_price_nanoton !== undefined) params.append('max_price_nanoton', filters.max_price_nanoton.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

    const { data } = await apiClient.get<MarketListing[]>(`/market/listings?${params.toString()}`);
    return data;
  }

  /**
   * Initiate purchase from market
   * @param request - Purchase request
   * @returns Promise with purchase initiation result
   */
  async purchaseFromMarket(request: PurchaseRequest): Promise<PurchaseResponse> {
    const { data } = await apiClient.post<PurchaseResponse>('/market/purchase', request);
    return data;
  }

  /**
   * Complete purchase after TON payment
   * @param request - Complete purchase request
   * @returns Promise with completion result
   */
  async completePurchase(request: CompletePurchaseRequest): Promise<CompletePurchaseResponse> {
    const { data } = await apiClient.post<CompletePurchaseResponse>('/market/complete-purchase', request);
    return data;
  }

  /**
   * Cancel a market listing
   * @param listingId - ID of the listing to cancel
   * @returns Promise with cancellation result
   */
  async cancelListing(listingId: number): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete(`/market/listings/${listingId}`);
    return data;
  }

  /**
   * Get user's active listings
   * @returns Promise with array of user's listings
   */
  async getUserListings(): Promise<UserListing[]> {
    const { data } = await apiClient.get<UserListing[]>('/market/my-listings');
    return data;
  }

  /**
   * Get market statistics
   * @returns Promise with market stats
   */
  async getMarketStats(): Promise<MarketStats> {
    const { data } = await apiClient.get<MarketStats>('/market/stats');
    return data;
  }

  /**
   * Convert TON to nanoTON
   * @param ton - Amount in TON
   * @returns Amount in nanoTON
   */
  tonToNanoTon(ton: number): number {
    return Math.floor(ton * 1_000_000_000);
  }

  /**
   * Convert nanoTON to TON
   * @param nanoTon - Amount in nanoTON
   * @returns Amount in TON
   */
  nanoTonToTon(nanoTon: number): number {
    return nanoTon / 1_000_000_000;
  }

  /**
   * Format TON amount for display
   * @param nanoTon - Amount in nanoTON
   * @param decimals - Number of decimal places
   * @returns Formatted TON string
   */
  formatTon(nanoTon: number, decimals: number = 3): string {
    return this.nanoTonToTon(nanoTon).toFixed(decimals);
  }

  /**
   * Get transaction status
   * @param transactionUuid - Transaction UUID
   * @returns Promise with transaction status
   */
  async getTransactionStatus(transactionUuid: string): Promise<TransactionStatusResponse> {
    const { data } = await apiClient.get<TransactionStatusResponse>(`/market/transactions/${transactionUuid}/status`);
    return data;
  }

  /**
   * Cleanup expired transactions (admin endpoint)
   * @returns Promise with cleanup result
   */
  async cleanupExpiredTransactions(): Promise<CleanupResponse> {
    const { data } = await apiClient.post<CleanupResponse>('/market/transactions/cleanup');
    return data;
  }
}

export default new MarketService(); 