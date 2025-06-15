import { useState, useCallback, useRef, useEffect } from 'react';
import { useApi } from '../api/hooks/useApi';

const CLICK_BATCH_SIZE = 50; // Отправляем каждые 50 кликов
const CLICK_BATCH_TIMEOUT = 5000; // Или каждые 5 секунд
const LOCAL_STORAGE_KEY = 'pending_clicks';

export const useClickBatching = () => {
  const api = useApi();
  const [pendingClicks, setPendingClicks] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const timeoutRef = useRef(null);

  // Загружаем сохранённые клики при инициализации
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const count = parseInt(saved, 10);
      if (count > 0) {
        setPendingClicks(count);
        // Отправляем сохранённые клики
        sendPendingClicks(count);
      }
    }
  }, []);

  // Сохраняем клики в localStorage при изменении
  useEffect(() => {
    if (pendingClicks > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, pendingClicks.toString());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [pendingClicks]);

  const sendPendingClicks = useCallback(async (clickCount = pendingClicks) => {
    if (clickCount <= 0 || isSending) return;

    try {
      setIsSending(true);
      
      const response = await api.game.batchIncrementClicks(clickCount);
      
      if (response.success) {
        setPendingClicks(prev => Math.max(0, prev - clickCount));
        
        // Очищаем таймер
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        return response;
      }
    } catch (error) {
      console.error('Failed to send clicks:', error);
      // Не сбрасываем клики при ошибке - они останутся в очереди
    } finally {
      setIsSending(false);
    }
  }, [api, pendingClicks, isSending]);

  const addClick = useCallback(() => {
    setPendingClicks(prev => prev + 1);

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Проверяем, нужно ли отправить сразу
    if (pendingClicks + 1 >= CLICK_BATCH_SIZE) {
      sendPendingClicks(pendingClicks + 1);
    } else {
      // Устанавливаем таймер на отправку через время
      timeoutRef.current = setTimeout(() => {
        sendPendingClicks();
      }, CLICK_BATCH_TIMEOUT);
    }
  }, [pendingClicks, sendPendingClicks]);

  const addClicks = useCallback((count) => {
    setPendingClicks(prev => prev + count);

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Проверяем, нужно ли отправить сразу
    if (pendingClicks + count >= CLICK_BATCH_SIZE) {
      sendPendingClicks(pendingClicks + count);
    } else {
      // Устанавливаем таймер на отправку через время
      timeoutRef.current = setTimeout(() => {
        sendPendingClicks();
      }, CLICK_BATCH_TIMEOUT);
    }
  }, [pendingClicks, sendPendingClicks]);

  // Принудительная отправка всех накопленных кликов
  const flushClicks = useCallback(() => {
    if (pendingClicks > 0) {
      sendPendingClicks();
    }
  }, [pendingClicks, sendPendingClicks]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Отправляем накопленные клики при закрытии
      if (pendingClicks > 0) {
        sendPendingClicks();
      }
    };
  }, [pendingClicks, sendPendingClicks]);

  return {
    pendingClicks,
    isSending,
    addClick,
    addClicks,
    flushClicks,
  };
}; 