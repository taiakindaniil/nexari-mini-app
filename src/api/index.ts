import apiClient, { setInitData } from './apiClient';
import createApiService from './createService';
import useApi from './hooks/useApi';

import userService from './services/userService';
import type { UserProfile, UserProfileUpdate, SyncResponse, ReferralResponse } from './services/userService';
// Export services
export {
  // API client
  apiClient,
  setInitData,
  
  // User service
  userService,
  
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
  setInitData,
};

export default api; 