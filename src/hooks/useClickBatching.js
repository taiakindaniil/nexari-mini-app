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
  const pendingClicksRef = useRef(0);

  // Синхронизируем ref с state
  useEffect(() => {
    pendingClicksRef.current = pendingClicks;
  }, [pendingClicks]);

  // Загружаем сохранённые клики при инициализации
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const count = parseInt(saved, 10);
      if (count > 0) {
        setPendingClicks(count);
        pendingClicksRef.current = count;
        // Отправляем сохранённые клики
        setTimeout(() => sendPendingClicks(count), 100);
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

  const sendPendingClicks = useCallback(async (clickCount) => {
    // Используем текущее значение из ref если clickCount не передан
    const actualClickCount = clickCount || pendingClicksRef.current;
    
    if (actualClickCount <= 0 || isSending) {
      console.log(`[ClickBatching] Skipping send: count=${actualClickCount}, isSending=${isSending}`);
      return;
    }

    console.log(`[ClickBatching] Sending ${actualClickCount} clicks to server`);

    try {
      setIsSending(true);
      
      const response = await api.game.batchIncrementClicks(actualClickCount);
      
      if (response.success) {
        console.log(`[ClickBatching] Successfully sent ${actualClickCount} clicks`);
        setPendingClicks(prev => Math.max(0, prev - actualClickCount));
        
        // Очищаем таймер
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        return response;
      }
    } catch (error) {
      console.error('[ClickBatching] Failed to send clicks:', error);
      // Не сбрасываем клики при ошибке - они останутся в очереди
    } finally {
      setIsSending(false);
    }
  }, [api, isSending]);

  const addClick = useCallback(() => {
    setPendingClicks(prev => {
      const newCount = prev + 1;
      console.log(`[ClickBatching] Added click, pending: ${newCount}`);
      
      // Очищаем предыдущий таймер
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Проверяем, нужно ли отправить сразу
      if (newCount >= CLICK_BATCH_SIZE) {
        console.log(`[ClickBatching] Batch size reached (${newCount}), sending immediately`);
        // Отправляем с небольшой задержкой чтобы избежать race condition
        setTimeout(() => sendPendingClicks(newCount), 10);
      } else {
        console.log(`[ClickBatching] Setting timeout for ${CLICK_BATCH_TIMEOUT}ms`);
        // Устанавливаем таймер на отправку через время
        timeoutRef.current = setTimeout(() => {
          sendPendingClicks();
        }, CLICK_BATCH_TIMEOUT);
      }
      
      return newCount;
    });
  }, [sendPendingClicks]);

  const addClicks = useCallback((count) => {
    setPendingClicks(prev => {
      const newCount = prev + count;
      
      // Очищаем предыдущий таймер
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Проверяем, нужно ли отправить сразу
      if (newCount >= CLICK_BATCH_SIZE) {
        // Отправляем с небольшой задержкой чтобы избежать race condition
        setTimeout(() => sendPendingClicks(newCount), 10);
      } else {
        // Устанавливаем таймер на отправку через время
        timeoutRef.current = setTimeout(() => {
          sendPendingClicks();
        }, CLICK_BATCH_TIMEOUT);
      }
      
      return newCount;
    });
  }, [sendPendingClicks]);

  // Принудительная отправка всех накопленных кликов
  const flushClicks = useCallback(() => {
    if (pendingClicksRef.current > 0 && !isSending) {
      sendPendingClicks();
    }
  }, [sendPendingClicks, isSending]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Отправляем накопленные клики при закрытии
      if (pendingClicksRef.current > 0) {
        sendPendingClicks(pendingClicksRef.current);
      }
    };
  }, [sendPendingClicks]);

  return {
    pendingClicks,
    isSending,
    addClick,
    addClicks,
    flushClicks,
  };
}; 