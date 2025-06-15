import { useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useApi } from '../api/hooks/useApi';

export const useTonConnect = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  
  const api = useApi();

  // Handle wallet connection/disconnection events
  useEffect(() => {
    if (!tonConnectUI) return;

    const handleWalletChange = async () => {
      try {
        if (wallet && wallet.account) {
          // Wallet connected - sync to database
          console.log('Wallet connected:', wallet.account.address);
          
          const result = await api.wallet.connectWallet(wallet.account.address);
          
          if (result.success) {
            console.log('Wallet synced to database:', result.message);
          } else {
            console.error('Failed to sync wallet:', result.message);
          }
        } else {
          // Wallet disconnected - remove from database
          console.log('Wallet disconnected');
          
          const result = await api.wallet.disconnectWallet();
          console.log('Wallet removed from database:', result.message);
        }
      } catch (error) {
        console.error('Error syncing wallet:', error);
      }
    };

    // Initial check and setup listener
    handleWalletChange();

    // Listen for wallet status changes
    const unsubscribe = tonConnectUI.onStatusChange(handleWalletChange);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, wallet]);

  return {
    // TonConnect state
    wallet,
    tonConnectUI,
    
    // Helper getters
    isWalletConnected: wallet !== null && wallet.account !== null,
    walletAddress: wallet?.account?.address
  };
}; 