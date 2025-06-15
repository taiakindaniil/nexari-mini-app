import apiClient, { setInitData } from './apiClient';
import createApiService from './createService';
import useApi from './hooks/useApi';

import userService from './services/userService';
import type { UserProfile, UserProfileUpdate, SyncResponse, ReferralResponse } from './services/userService';
import walletService from './services/walletService';

// Export services
export {
  // API client
  apiClient,
  setInitData,
  
  // User service
  userService,

  // Wallet service
  walletService,
  
  // Hooks
  useApi,
  
  // Helpers
  createApiService,
};

// Export types
export type {
  // User types
  UserProfile,
  UserProfileUpdate,
  SyncResponse,
  ReferralResponse,
};

// Create a single API object that contains all services
const api = {
  user: userService,
  wallet: walletService,
  setInitData,
};

export default api; 