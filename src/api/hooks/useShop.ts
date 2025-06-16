import { useState, useCallback } from 'react';
import shopService, { 
  CaseData, 
  InventoryItem, 
  PurchaseCaseRequest, 
  PurchaseCaseResponse,
  CaseHistoryEntry,
  CaseDetails
} from '../services/shopService';

export interface UseShopReturn {
  // State
  cases: CaseData[];
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCases: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  purchaseCase: (request: PurchaseCaseRequest) => Promise<PurchaseCaseResponse>;
  getCaseHistory: (limit?: number) => Promise<CaseHistoryEntry[]>;
  getCaseDetails: (caseId: number) => Promise<CaseDetails>;
  clearError: () => void;
}

/**
 * Custom hook for shop operations
 */
export const useShop = (): UseShopReturn => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shopService.getCases();
      setCases(data);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      setError(null);
      const data = await shopService.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    }
  }, []);

  const purchaseCase = useCallback(async (request: PurchaseCaseRequest): Promise<PurchaseCaseResponse> => {
    try {
      setError(null);
      const result = await shopService.purchaseCase(request);
      
      // Refresh inventory after successful purchase
      if (result.success) {
        await fetchInventory();
      }
      
      return result;
    } catch (err) {
      console.error('Error purchasing case:', err);
      const errorMessage = 'Failed to purchase case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchInventory]);

  const getCaseHistory = useCallback(async (limit: number = 50): Promise<CaseHistoryEntry[]> => {
    try {
      setError(null);
      return await shopService.getCaseHistory(limit);
    } catch (err) {
      console.error('Error fetching case history:', err);
      setError('Failed to load case history');
      return [];
    }
  }, []);

  const getCaseDetails = useCallback(async (caseId: number): Promise<CaseDetails> => {
    try {
      setError(null);
      return await shopService.getCaseDetails(caseId);
    } catch (err) {
      console.error('Error fetching case details:', err);
      setError('Failed to load case details');
      throw err;
    }
  }, []);

  return {
    cases,
    inventory,
    loading,
    error,
    fetchCases,
    fetchInventory,
    purchaseCase,
    getCaseHistory,
    getCaseDetails,
    clearError,
  };
};

export default useShop; 