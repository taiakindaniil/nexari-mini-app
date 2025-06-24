import apiClient from '../apiClient';

export interface Character {
  id: number;
  name: string;
  description: string;
  image_url: string;
  base_income_rate: number;
  base_price: number;
  max_level: number;
  rarity: string;
}

export interface UserCharacter {
  id: number;
  character_id: number;
  name: string;
  description: string;
  image_url: string;
  level: number;
  current_income_rate: number;
  is_active: boolean;
  experience: number;
  max_level: number;
  rarity: string;
  upgrade_cost?: number;
  can_upgrade: boolean;
  acquired_at: string;
}

export interface ShopCharactersResponse {
  success: boolean;
  characters: Character[];
}

export interface InventoryResponse {
  success: boolean;
  inventory: UserCharacter[];
}

export interface PurchaseCharacterRequest {
  character_id: number;
}

export interface PurchaseCharacterResponse {
  success: boolean;
  character?: {
    id: number;
    name: string;
    level: number;
    income_rate: number;
  };
  remaining_balance?: number;
  error?: string;
}

export interface UpgradeCharacterRequest {
  user_character_id: number;
}

export interface UpgradeCharacterResponse {
  success: boolean;
  character?: {
    id: number;
    name: string;
    level: number;
    income_rate: number;
    next_upgrade_cost?: number;
  };
  remaining_balance?: number;
  error?: string;
}

export interface SetActiveCharacterRequest {
  user_character_id: number;
}

export interface SetActiveCharacterResponse {
  success: boolean;
  active_character?: {
    id: number;
    name: string;
    level: number;
    income_rate: number;
    image_url: string;
  };
  claimed_diamonds?: number;
  error?: string;
}

export interface CharacterDetailsResponse {
  success: boolean;
  character: UserCharacter;
}

/**
 * Service for handling character-related API calls
 */
class CharacterService {
  /**
   * Get all available characters from the shop
   */
  async getShopCharacters(): Promise<ShopCharactersResponse> {
    const { data } = await apiClient.get<ShopCharactersResponse>('/characters/shop');
    return data;
  }

  /**
   * Get user's character inventory
   */
  async getUserInventory(): Promise<InventoryResponse> {
    const { data } = await apiClient.get<InventoryResponse>('/characters/inventory');
    return data;
  }

  /**
   * Purchase a character from the shop
   */
  async purchaseCharacter(characterId: number): Promise<PurchaseCharacterResponse> {
    const { data } = await apiClient.post<PurchaseCharacterResponse>('/characters/purchase', {
      character_id: characterId,
    });
    return data;
  }

  /**
   * Upgrade a user's character
   */
  async upgradeCharacter(userCharacterId: number): Promise<UpgradeCharacterResponse> {
    const { data } = await apiClient.post<UpgradeCharacterResponse>('/characters/upgrade', {
      user_character_id: userCharacterId,
    });
    return data;
  }

  /**
   * Set a character as active for farming
   */
  async setActiveCharacter(userCharacterId: number): Promise<SetActiveCharacterResponse> {
    const { data } = await apiClient.post<SetActiveCharacterResponse>('/characters/set-active', {
      user_character_id: userCharacterId,
    });
    return data;
  }

  /**
   * Get detailed information about a user's character
   */
  async getCharacterDetails(userCharacterId: number): Promise<CharacterDetailsResponse> {
    const { data } = await apiClient.get<CharacterDetailsResponse>(`/characters/${userCharacterId}`);
    return data;
  }
}

export const characterService = new CharacterService();
export default characterService; 