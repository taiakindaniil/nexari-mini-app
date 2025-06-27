import { useState, useCallback } from 'react';
import shopService, { 
  CaseData, 
  InventoryItem, 
  PurchaseCaseRequest, 
  PurchaseCaseResponse,
  CaseHistoryEntry,
  CaseDetails,
  UpgradeCharacterRequest,
  UpgradeCharacterResponse,
  SetActiveCharacterRequest,
  SetActiveCharacterResponse
} from '../services/shopService';

export interface UseShopReturn {
  // State
  cases: CaseData[];
  inventory: InventoryItem[];
  selectedCharacter: InventoryItem | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchCases: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  purchaseCase: (request: PurchaseCaseRequest) => Promise<PurchaseCaseResponse>;
  getCaseHistory: (limit?: number) => Promise<CaseHistoryEntry[]>;
  getCaseDetails: (caseId: number) => Promise<CaseDetails>;
  upgradeCharacter: (characterId: number) => Promise<UpgradeCharacterResponse>;
  setActiveCharacter: (characterId: number) => Promise<SetActiveCharacterResponse>;
  selectCharacter: (character: InventoryItem | null) => void;
  clearError: () => void;
}

/**
 * Custom hook for shop operations
 */
export const useShop = (): UseShopReturn => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<InventoryItem | null>(null);
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

  const upgradeCharacter = useCallback(async (characterId: number): Promise<UpgradeCharacterResponse> => {
    try {
      setError(null);
      const result = await shopService.upgradeCharacter({ character_id: characterId });
      
      // Refresh inventory after successful upgrade
      if (result.success) {
        await fetchInventory();
        // Update selected character if it was upgraded
        if (selectedCharacter && selectedCharacter.id === characterId) {
          const updatedInventory = await shopService.getInventory();
          const updatedCharacter = updatedInventory.find(item => item.id === characterId);
          if (updatedCharacter) {
            setSelectedCharacter(updatedCharacter);
          }
        }
      }
      
      return result;
    } catch (err) {
      console.error('Error upgrading character:', err);
      const errorMessage = 'Failed to upgrade character';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchInventory, selectedCharacter]);

  const setActiveCharacter = useCallback(async (characterId: number): Promise<SetActiveCharacterResponse> => {
    try {
      setError(null);
      const result = await shopService.setActiveCharacter({ character_id: characterId });
      
      // Refresh inventory after successful activation
      if (result.success) {
        // Immediately update local inventory state to reflect the change
        setInventory(prevInventory => 
          prevInventory.map(item => ({
            ...item,
            is_active: item.id === characterId
          }))
        );
        
        // Still refresh inventory in background for consistency
        fetchInventory().catch(err => {
          console.warn('Background inventory refresh failed:', err);
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error setting active character:', err);
      const errorMessage = 'Failed to set active character';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchInventory]);

  const selectCharacter = useCallback((character: InventoryItem | null) => {
    setSelectedCharacter(character);
  }, []);

  return {
    cases,
    inventory,
    selectedCharacter,
    loading,
    error,
    fetchCases,
    fetchInventory,
    purchaseCase,
    getCaseHistory,
    getCaseDetails,
    upgradeCharacter,
    setActiveCharacter,
    selectCharacter,
    clearError,
  };
};

export default useShop; 