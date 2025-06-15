import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../api/hooks/useApi';
import { useClickBatching } from './useClickBatching';

export const useGameAPI = () => {
  const api = useApi();
  const [gameStatus, setGameStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Используем батчинг кликов
  const { pendingClicks, isSending, addClick, flushClicks } = useClickBatching();

  // Fetch game status
  const fetchGameStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.game.getStatus();
      if (response.success) {
        setGameStatus({
          ...response.data,
          // Добавляем локальные клики к серверному счётчику
          total_clicks: response.data.total_clicks + pendingClicks
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch game status:', err);
    } finally {
      setLoading(false);
    }
  }, [api, pendingClicks]);

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
      
      // Отправляем накопленные клики перед клеймом
      await flushClicks();
      
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
  }, [api, fetchGameStatus, flushClicks]);

  // Increment clicks (теперь использует батчинг)
  const incrementClicks = useCallback(() => {
    try {
      addClick();
      
      // Обновляем локальный счётчик сразу для лучшего UX
      setGameStatus(prev => prev ? {
        ...prev,
        total_clicks: prev.total_clicks + 1
      } : null);
      
      return Promise.resolve({ success: true });
    } catch (err) {
      console.error('Failed to add click:', err);
      return Promise.reject(err);
    }
  }, [addClick]);

  // Initialize game status on mount
  useEffect(() => {
    fetchGameStatus();
  }, [fetchGameStatus]);

  // Refresh game status every 30 seconds
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
    pendingClicks,
    isSendingClicks: isSending,
    flushClicks,
  };
}; 