import apiClient, { setInitData } from './apiClient';
import createApiService from './createService';
import useApi from './hooks/useApi';

import userService from './services/userService';
import type { UserProfile, UserProfileUpdate, SyncResponse, ReferralResponse } from './services/userService';
import walletService from './services/walletService';
import gameService from './services/gameService';
import type { GameStatus, StartFarmingResponse, ClaimDiamondsResponse, ClickResponse, GameStatusResponse } from './services/gameService';
import characterService from './services/characterService';
import type { Character, UserCharacter, ShopCharactersResponse, InventoryResponse, PurchaseCharacterResponse, UpgradeCharacterResponse, SetActiveCharacterResponse, CharacterDetailsResponse } from './services/characterService';

// Export services
export {
  // API client
  apiClient,
  setInitData,
  
  // User service
  userService,

  // Wallet service
  walletService,
  
  // Game service
  gameService,
  
  // Character service
  characterService,
  
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
  
  // Game types
  GameStatus,
  StartFarmingResponse,
  ClaimDiamondsResponse,
  ClickResponse,
  GameStatusResponse,
  
  // Character types
  Character,
  UserCharacter,
  ShopCharactersResponse,
  InventoryResponse,
  PurchaseCharacterResponse,
  UpgradeCharacterResponse,
  SetActiveCharacterResponse,
  CharacterDetailsResponse,
};

// Create a single API object that contains all services
const api = {
  user: userService,
  wallet: walletService,
  game: gameService,
  character: characterService,
  setInitData,
};

export default api; 