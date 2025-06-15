import { useEffect, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useApi } from '../api/hooks/useApi';

export const useTonConnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const api = useApi();
  
  // Храним предыдущее состояние кошелька для отслеживания изменений
  const prevWalletAddressRef = useRef<string | null>(null);

  // Функция для обработки изменений кошелька
  const handleWalletChange = async (currentWallet: typeof wallet) => {
    try {
      const currentAddress = currentWallet?.account?.address || null;
      const prevAddress = prevWalletAddressRef.current;
      
      console.log('Wallet change detected:', {
        prevAddress,
        currentAddress,
        isConnected: !!currentAddress
      });
      
      // Пропускаем обработку, если адрес не изменился
      if (currentAddress === prevAddress) {
        console.log('Address unchanged, skipping');
        return;
      }

      if (currentAddress) {
        // Wallet connected - sync to database
        console.log('Processing wallet connection:', currentAddress);
        
        const result = await api.wallet.connectWallet(currentAddress);
        
        if (result.success) {
          console.log('Wallet synced to database:', result.message);
        } else {
          console.error('Failed to sync wallet:', result.message);
        }
      } else if (prevAddress) {
        // Wallet disconnected - remove from database (только если ранее был подключен)
        console.log('Processing wallet disconnection, prev address was:', prevAddress);
        
        const result = await api.wallet.disconnectWallet();
        
        if (result.success) {
          console.log('Wallet removed from database:', result.message);
        } else {
          console.error('Failed to remove wallet:', result.message);
        }
      }
      
      // Обновляем предыдущее состояние
      prevWalletAddressRef.current = currentAddress;
      console.log('Updated prevWalletAddressRef to:', currentAddress);
    } catch (error) {
      console.error('Error syncing wallet:', error);
    }
  };

  // Основное отслеживание через TonConnectUI onStatusChange
  useEffect(() => {
    if (!tonConnectUI) return;

    // Устанавливаем начальное значение
    const initialAddress = wallet?.account?.address || null;
    if (prevWalletAddressRef.current === null) {
      prevWalletAddressRef.current = initialAddress;
      console.log('Set initial prevWalletAddressRef to:', initialAddress);
    }

    // Устанавливаем listener
    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      console.log('TonConnect status changed:', walletInfo);
      handleWalletChange(walletInfo);
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, api.wallet]);

  return {
    // TonConnect state
    wallet,
    tonConnectUI,
    
    // Helper getters
    isWalletConnected: wallet !== null && wallet.account !== null,
    walletAddress: wallet?.account?.address
  };
}; 