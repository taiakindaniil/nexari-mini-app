import { useEffect } from 'react';
import { initDataRaw as _initDataRaw, useSignal } from '@telegram-apps/sdk-react';
import { setInitData } from '../apiClient';
import api from '../index';

/**
 * Custom hook to set up API for use with Telegram Mini App
 * This automatically handles setting the init data for API requests
 * 
 * @returns The API object with all services
 */
export const useApi = () => {
  const initDataRaw = useSignal(_initDataRaw);
  
  useEffect(() => {
    // Set the init data for API calls whenever it changes
    if (initDataRaw) {
      setInitData(initDataRaw);
    }
    
    // Don't clean up initData on unmount to prevent losing auth
    // when components unmount/remount during page navigation
    // The initData should persist across navigation
  }, [initDataRaw]);
  
  return api;
};

export default useApi; 