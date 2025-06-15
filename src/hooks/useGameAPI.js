import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../api/hooks/useApi';

export const useGameAPI = () => {
  const api = useApi();
  const [gameStatus, setGameStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch game status
  const fetchGameStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.game.getStatus();
      if (response.success) {
        setGameStatus(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch game status:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Start farming
  const startFarming = useCallback(async (characterId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.game.startFarming(characterId);
      if (response.success) {
        await fetchGameStatus(); // Refresh status
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to start farming:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchGameStatus]);

  // Claim diamonds
  const claimDiamonds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.game.claimDiamonds();
      if (response.success) {
        await fetchGameStatus(); // Refresh status
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to claim diamonds:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchGameStatus]);

  // Increment clicks
  const incrementClicks = useCallback(async () => {
    try {
      const response = await api.game.incrementClicks();
      if (response.success) {
        // Update local state without full refresh for better UX
        setGameStatus(prev => prev ? {
          ...prev,
          total_clicks: response.total_clicks
        } : null);
        return response;
      }
    } catch (err) {
      console.error('Failed to increment clicks:', err);
      // Don't throw error for clicks as it's not critical
    }
  }, [api]);

  // Initialize game status on mount
  useEffect(() => {
    fetchGameStatus();
  }, [fetchGameStatus]);

  // Auto-refresh game status every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchGameStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchGameStatus]);

  return {
    gameStatus,
    loading,
    error,
    fetchGameStatus,
    startFarming,
    claimDiamonds,
    incrementClicks,
  };
}; 