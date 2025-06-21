import { useState, useCallback } from 'react';
import marketService, {
  MarketListing,
  CreateListingRequest,
  PurchaseRequest,
  UserListing,
  MarketStats
} from '../services/marketService';

export const useMarket = () => {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [myListings, setMyListings] = useState<UserListing[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchListings = useCallback(async (
    characterFilter?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = 'newest',
    limit: number = 50,
    offset: number = 0
  ) => {
    try {
      setLoading(true);
      clearError();
      const data = await marketService.getListings(characterFilter, minPrice, maxPrice, sortBy, limit, offset);
      setListings(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch market listings');
      console.error('Error fetching market listings:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const createListing = useCallback(async (request: CreateListingRequest) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.createListing(request);
      
      if (result.success) {
        // Refresh listings after creating
        await fetchListings();
        await fetchMyListings();
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to create listing';
      setError(errorMessage);
      console.error('Error creating listing:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchListings]);

  const purchase = useCallback(async (request: PurchaseRequest) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.purchase(request);
      
      if (result.success) {
        // Refresh listings after purchase
        await fetchListings();
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to purchase';
      setError(errorMessage);
      console.error('Error purchasing from market:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchListings]);

  const cancelListing = useCallback(async (listingId: number) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.cancelListing(listingId);
      
      if (result.success) {
        // Refresh listings after cancellation
        await fetchListings();
        await fetchMyListings();
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to cancel listing';
      setError(errorMessage);
      console.error('Error cancelling listing:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchListings]);

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await marketService.getMyListings();
      setMyListings(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch my listings');
      console.error('Error fetching my listings:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const fetchStats = useCallback(async () => {
    try {
      clearError();
      const data = await marketService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch market stats');
      console.error('Error fetching market stats:', err);
    }
  }, [clearError]);

  return {
    listings,
    myListings,
    stats,
    loading,
    error,
    fetchListings,
    createListing,
    purchase,
    cancelListing,
    fetchMyListings,
    fetchStats,
    clearError
  };
}; 