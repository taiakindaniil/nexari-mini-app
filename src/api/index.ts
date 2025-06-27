import apiClient, { setInitData } from './apiClient';
import createApiService from './createService';
import useApi from './hooks/useApi';

import userService from './services/userService';
import type { UserProfile, UserProfileUpdate, SyncResponse, ReferralResponse } from './services/userService';
import walletService from './services/walletService';
import gameService from './services/gameService';
import type { GameStatus, StartFarmingResponse, ClaimDiamondsResponse, GameStatusResponse } from './services/gameService';
import characterService from './services/characterService';
import type { Character, UserCharacter, ShopCharactersResponse, InventoryResponse, PurchaseCharacterResponse, UpgradeCharacterResponse, SetActiveCharacterResponse, CharacterDetailsResponse } from './services/characterService';
import shopService from './services/shopService';
import type { CaseData, InventoryItem, CaseReward, PurchaseCaseRequest, PurchaseCaseResponse, CaseHistoryEntry, CaseDetails } from './services/shopService';
import questService from './services/questService';
import type { Quest, QuestListResponse, QuestClaimResponse, QuestProgressRequest } from './services/questService';
import referralService from './services/referralService';
import type { ReferralStats, ReferralUser, ReferralListResponse, ClaimRewardsResponse } from './services/referralService';

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
  
  // Shop service
  shopService,
  
  // Quest service
  questService,
  
  // Referral service
  referralService,
  
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
  
  // Shop types
  CaseData,
  InventoryItem,
  CaseReward,
  PurchaseCaseRequest,
  PurchaseCaseResponse,
  CaseHistoryEntry,
  CaseDetails,
  
  // Quest types
  Quest,
  QuestListResponse,
  QuestClaimResponse,
  QuestProgressRequest,
  
  // Referral types
  ReferralStats,
  ReferralUser,
  ReferralListResponse,
  ClaimRewardsResponse,
};

// Create a single API object that contains all services
const api = {
  user: userService,
  wallet: walletService,
  game: gameService,
  character: characterService,
  shop: shopService,
  quest: questService,
  setInitData,
};

export default api; 