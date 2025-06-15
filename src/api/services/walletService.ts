import apiClient from '../apiClient';

export interface WalletConnectRequest {
  address: string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  wallet_address?: string;
}

export interface WalletStatus {
  connected: boolean;
  wallet_address?: string;
  connected_at?: string;
}

/**
 * Service for handling wallet-related API calls
 */
class WalletService {
  /**
   * Connect user's TON wallet
   * @param address - Wallet address to connect
   * @returns Promise with connection result
   */
  async connectWallet(address: string): Promise<WalletResponse> {
    const { data } = await apiClient.post<WalletResponse>('/wallet/connect', {
      address
    });
    return data;
  }

  /**
   * Disconnect user's TON wallet
   * @returns Promise with disconnection result
   */
  async disconnectWallet(): Promise<WalletResponse> {
    const { data } = await apiClient.delete<WalletResponse>('/wallet/disconnect');
    return data;
  }

  /**
   * Get current wallet connection status
   * @returns Promise with wallet status
   */
  async getWalletStatus(): Promise<WalletStatus> {
    const { data } = await apiClient.get<WalletStatus>('/wallet/status');
    return data;
  }
}

export const walletService = new WalletService();
export default walletService; 