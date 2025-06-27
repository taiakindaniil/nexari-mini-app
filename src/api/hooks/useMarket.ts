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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

  // Function to immediately remove a listing from local state (for instant UI feedback)
  const removeListingFromState = useCallback((listingId: number) => {
    setListings(prev => prev.filter(listing => listing.id !== listingId));
    setMyListings(prev => prev.filter(listing => listing.id !== listingId));
  }, []);

  // Function to mark a purchase as initiated (for transaction tracking)
  const markPurchaseInitiated = useCallback((listingId: number, transactionUuid: string) => {
    // Store initiated purchases in localStorage for persistence across page reloads
    const initiatedPurchases = JSON.parse(localStorage.getItem('initiatedPurchases') || '{}');
    initiatedPurchases[listingId] = {
      transactionUuid,
      timestamp: Date.now(),
      expires: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    localStorage.setItem('initiatedPurchases', JSON.stringify(initiatedPurchases));
    
    // Remove from listings immediately
    removeListingFromState(listingId);
  }, [removeListingFromState]);

  // Function to clean up expired initiated purchases
  const cleanupExpiredPurchases = useCallback(() => {
    const initiatedPurchases = JSON.parse(localStorage.getItem('initiatedPurchases') || '{}');
    const now = Date.now();
    let hasChanges = false;
    
    Object.keys(initiatedPurchases).forEach(listingId => {
      if (initiatedPurchases[listingId].expires < now) {
        delete initiatedPurchases[listingId];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      localStorage.setItem('initiatedPurchases', JSON.stringify(initiatedPurchases));
    }
  }, []);

  // Enhanced fetchListings that respects initiated purchases
  const fetchListingsEnhanced = useCallback(async (filters: MarketFilters = {}) => {
    try {
      setLoading(true);
      clearError();
      
      // Clean up expired purchases first
      cleanupExpiredPurchases();
      
      const data = await marketService.getMarketListings(filters);
      
      // Filter out listings that have initiated purchases
      const initiatedPurchases = JSON.parse(localStorage.getItem('initiatedPurchases') || '{}');
      const filteredData = data.filter(listing => !initiatedPurchases[listing.id]);
      
      setListings(filteredData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to fetch market listings');
      console.error('Error fetching market listings:', err);
    } finally {
      setLoading(false);
    }
  }, [clearError, cleanupExpiredPurchases]);

  // Function to clear a completed purchase from localStorage
  const clearPurchaseFromStorage = useCallback((listingId: number) => {
    const initiatedPurchases = JSON.parse(localStorage.getItem('initiatedPurchases') || '{}');
    delete initiatedPurchases[listingId];
    localStorage.setItem('initiatedPurchases', JSON.stringify(initiatedPurchases));
  }, []);

  const completePurchase = useCallback(async (request: CompletePurchaseRequest) => {
    try {
      setLoading(true);
      clearError();
      const result = await marketService.completePurchase(request);
      
      if (result.success) {
        // Find and clear from localStorage using transaction_uuid
        const initiatedPurchases = JSON.parse(localStorage.getItem('initiatedPurchases') || '{}');
        const listingIdToRemove = Object.keys(initiatedPurchases).find(
          listingId => initiatedPurchases[listingId].transactionUuid === request.transaction_uuid
        );
        
        if (listingIdToRemove) {
          clearPurchaseFromStorage(parseInt(listingIdToRemove));
        }
        
        // Refresh listings after successful purchase
        await fetchListingsEnhanced();
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
  }, [clearError, fetchListingsEnhanced, clearPurchaseFromStorage]);

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

  const cancelListingWithRefresh = useCallback(async (listingId: number) => {
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
    cancelListingWithRefresh,
    fetchMyListings,
    fetchStats,
    clearError,
    // TON utility methods
    tonToNanoTon,
    nanoTonToTon,
    formatTon,
    removeListingFromState,
    markPurchaseInitiated,
    cleanupExpiredPurchases,
    fetchListingsEnhanced,
    clearPurchaseFromStorage
  };
}; 