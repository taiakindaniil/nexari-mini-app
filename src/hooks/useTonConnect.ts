import { useEffect, useRef } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useApi } from '../api/hooks/useApi';

export const useTonConnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const api = useApi();
  
  // Храним предыдущее состояние кошелька для отслеживания изменений
  const prevWalletRef = useRef<typeof wallet>(wallet);
  const isInitializedRef = useRef(false);

  // Handle wallet connection/disconnection events
  useEffect(() => {
    if (!tonConnectUI) return;

    const handleWalletChange = async (currentWallet: typeof wallet) => {
      try {
        const prevWallet = prevWalletRef.current;
        
        // Пропускаем обработку, если кошелек не изменился
        const currentAddress = currentWallet?.account?.address;
        const prevAddress = prevWallet?.account?.address;
        
        if (currentAddress === prevAddress) {
          return;
        }

        if (currentWallet && currentWallet.account) {
          // Wallet connected - sync to database
          console.log('Wallet connected:', currentWallet.account.address);
          
          const result = await api.wallet.connectWallet(currentWallet.account.address);
          
          if (result.success) {
            console.log('Wallet synced to database:', result.message);
          } else {
            console.error('Failed to sync wallet:', result.message);
          }
        } else if (prevWallet && prevWallet.account) {
          // Wallet disconnected - remove from database (только если ранее был подключен)
          console.log('Wallet disconnected');
          
          const result = await api.wallet.disconnectWallet();
          console.log('Wallet removed from database:', result.message);
        }
        
        // Обновляем предыдущее состояние
        prevWalletRef.current = currentWallet;
      } catch (error) {
        console.error('Error syncing wallet:', error);
      }
    };

    // Устанавливаем listener без начальной проверки
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      handleWalletChange(wallet);
    });

    // Обрабатываем текущее состояние только при первой инициализации
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      // Если кошелек уже подключен при инициализации, синхронизируем его
      if (wallet && wallet.account) {
        handleWalletChange(wallet);
      }
    }

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