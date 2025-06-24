import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../api/hooks/useApi';

export const useCharacters = () => {
  const api = useApi();
  const [shopCharacters, setShopCharacters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch shop characters
  const fetchShopCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.character.getShopCharacters();
      if (response.success) {
        setShopCharacters(response.characters);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch shop characters:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch user inventory
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.character.getUserInventory();
      if (response.success) {
        setInventory(response.inventory);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Purchase character
  const purchaseCharacter = useCallback(async (characterId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.character.purchaseCharacter(characterId);
      if (response.success) {
        await fetchInventory(); // Refresh inventory
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to purchase character:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchInventory]);

  // Upgrade character
  const upgradeCharacter = useCallback(async (userCharacterId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.character.upgradeCharacter(userCharacterId);
      if (response.success) {
        await fetchInventory(); // Refresh inventory
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to upgrade character:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchInventory]);

  // Set active character
  const setActiveCharacter = useCallback(async (userCharacterId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.character.setActiveCharacter(userCharacterId);
      if (response.success) {
        await fetchInventory(); // Refresh inventory
        
        // Show notification if diamonds were automatically claimed
        if (response.claimed_diamonds && response.claimed_diamonds > 0) {
          // Create a simple notification
          const notification = document.createElement('div');
          notification.textContent = `${response.claimed_diamonds} diamonds automatically saved when switching characters!`;
          notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4caf50;
            color: #fff;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
        
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to set active character:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchInventory]);

  // Get character details
  const getCharacterDetails = useCallback(async (userCharacterId) => {
    try {
      const response = await api.character.getCharacterDetails(userCharacterId);
      if (response.success) {
        return response.character;
      }
    } catch (err) {
      console.error('Failed to get character details:', err);
      throw err;
    }
  }, [api]);

  // Initialize data on mount
  useEffect(() => {
    fetchShopCharacters();
    fetchInventory();
  }, [fetchShopCharacters, fetchInventory]);

  return {
    shopCharacters,
    inventory,
    loading,
    error,
    fetchShopCharacters,
    fetchInventory,
    purchaseCharacter,
    upgradeCharacter,
    setActiveCharacter,
    getCharacterDetails,
  };
}; 