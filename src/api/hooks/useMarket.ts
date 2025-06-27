import { useState, useCallback } from 'react';
import marketService, {
  MarketListing,
  CreateListingRequest,
  PurchaseRequest,
  CompletePurchaseRequest,
  UserListing,
  MarketStats,
  MarketFilters
} from '../services/marketService';

export const useMarket = () => {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [myListings, setMyListings] = useState<UserListing[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchListings = useCallback(async (filters: MarketFilters = {}) => {
    try {
      setLoading(true);
      clearError();
      const data = await marketService.getMarketListings(filters);
      setListings(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch market listings');
      console.error('Error fetching market listings:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  // Alias for backward compatibility
  const fetchListingsEnhanced = fetchListings;

  const createListing = useCallback(async (request: CreateListingRequest) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.createListing(request);
      
      if (result.success) {
        // Refresh listings after successful creation
        await fetchListings();
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

  const initiatePurchase = useCallback(async (request: PurchaseRequest) => {
    try {
      clearError();
      const result = await marketService.purchaseFromMarket(request);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to initiate purchase';
      setError(errorMessage);
      console.error('Error initiating purchase:', err);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);

  const completePurchase = useCallback(async (request: CompletePurchaseRequest) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.completePurchase(request);
      
      if (result.success) {
        // Refresh listings after successful purchase
        await fetchListings();
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to complete purchase';
      setError(errorMessage);
      console.error('Error completing purchase:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchListings]);

  const cancelListing = useCallback(async (listingId: number) => {
    try {
      clearError();
      const result = await marketService.cancelListing(listingId);
      
      if (result.success) {
        // Optimistically remove item from local state
        setMyListings(prev => prev.filter(listing => listing.id !== listingId));
        setListings(prev => prev.filter(listing => listing.id !== listingId));
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to cancel listing';
      setError(errorMessage);
      console.error('Error cancelling listing:', err);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const data = await marketService.getUserListings();
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
      const data = await marketService.getMarketStats();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch market stats');
      console.error('Error fetching market stats:', err);
    }
  }, [clearError]);

  // Utility methods for TON conversion
  const tonToNanoTon = useCallback((ton: number) => {
    return marketService.tonToNanoTon(ton);
  }, []);

  const nanoTonToTon = useCallback((nanoTon: number) => {
    return marketService.nanoTonToTon(nanoTon);
  }, []);

  const formatTon = useCallback((nanoTon: number, decimals: number = 3) => {
    return marketService.formatTon(nanoTon, decimals);
  }, []);

  return {
    listings,
    myListings,
    stats,
    loading,
    error,
    fetchListings,
    createListing,
    initiatePurchase,
    completePurchase,
    cancelListing,
    fetchMyListings,
    fetchStats,
    clearError,
    // TON utility methods
    tonToNanoTon,
    nanoTonToTon,
    formatTon,
    // Backward compatibility
    fetchListingsEnhanced,
  };
}; 