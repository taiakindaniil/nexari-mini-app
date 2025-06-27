import apiClient from '../apiClient';

export interface CaseData {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  price_diamonds: number | null;
  price_ton: number | null;
  rarity: string;
  is_free: boolean;
  max_daily_opens: number | null;
}

export interface InventoryItem {
  id: number;
  character_id: number;
  name: string;
  level: number;
  current_income_rate: number;
  income_rate?: number;  // Для совместимости
  src: string;
  is_active: boolean;
  is_mutated: boolean;
  background: string;
  experience: number;
  acquired_at: string;
  rarity: string;  // Добавляем поле rarity
  upgrade_cost?: number;  // Добавляем стоимость улучшения
}

export interface CaseReward {
  type: string;
  name: string;
  src: string;
  background: string;
  value?: number;
  character_id?: number;
  level?: number;
  is_mutated?: boolean;
  income_rate?: number;
}

export interface PurchaseCaseRequest {
  case_id: number;
  payment_method: 'diamonds' | 'ton' | 'free';
}

export interface PurchaseCaseResponse {
  success: boolean;
  error?: string;
  reward?: CaseReward;
}

export interface UpgradeCharacterRequest {
  character_id: number;
}

export interface UpgradeCharacterResponse {
  success: boolean;
  error?: string;
  new_level?: number;
  new_income_rate?: number;
  cost?: number;
}

export interface SetActiveCharacterRequest {
  character_id: number;
}

export interface SetActiveCharacterResponse {
  success: boolean;
  error?: string;
  active_character?: {
    id: number;
    name: string;
    level: number;
    income_rate: number;
    image_url: string;
  };
  claimed_diamonds?: number;
}

export interface CaseHistoryEntry {
  id: number;
  case_name: string;
  payment_method: string;
  amount_paid: number | null;
  reward_type: string;
  reward_name: string;
  is_mutated: boolean;
  created_at: string;
}

export interface CaseDetails {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  price_diamonds: number | null;
  price_ton: number | null;
  rarity: string;
  is_free: boolean;
  max_daily_opens: number | null;
  rewards: Array<{
    id: number;
    reward_type: string;
    drop_chance: number;
    weight: number;
    diamonds_min?: number;
    diamonds_max?: number;
    character_name?: string;
    rarity?: string;
    image_url?: string;
    min_level?: number;
    max_level?: number;
    is_mutated_chance?: number;
  }>;
}

/**
 * Service for handling shop-related API calls
 */
class ShopService {
  /**
   * Get all available cases
   */
  async getCases(): Promise<CaseData[]> {
    const response = await apiClient.get<CaseData[]>('/shop/cases');
    return response.data;
  }

  /**
   * Get user's inventory
   */
  async getInventory(): Promise<InventoryItem[]> {
    try {
      // Try shop inventory first (for characters from cases)
      const shopResponse = await apiClient.get<InventoryItem[]>('/shop/inventory');
      return shopResponse.data;
    } catch (error) {
      // Fallback to characters inventory
      try {
        const charactersResponse = await apiClient.get<{success: boolean, inventory: InventoryItem[]}>('/characters/inventory');
        return charactersResponse.data.inventory || [];
      } catch (fallbackError) {
        console.error('Failed to fetch inventory from both endpoints:', error, fallbackError);
        return [];
      }
    }
  }

  /**
   * Purchase and open a case
   */
  async purchaseCase(request: PurchaseCaseRequest): Promise<PurchaseCaseResponse> {
    const response = await apiClient.post<PurchaseCaseResponse>('/shop/purchase', request);
    return response.data;
  }

  /**
   * Get user's case purchase history
   */
  async getCaseHistory(limit: number = 50): Promise<CaseHistoryEntry[]> {
    const response = await apiClient.get<CaseHistoryEntry[]>('/shop/history', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get detailed information about a specific case
   */
  async getCaseDetails(caseId: number): Promise<CaseDetails> {
    const response = await apiClient.get<CaseDetails>(`/shop/case/${caseId}`);
    return response.data;
  }

  /**
   * Upgrade a character in inventory
   */
  async upgradeCharacter(request: UpgradeCharacterRequest): Promise<UpgradeCharacterResponse> {
    const response = await apiClient.post<UpgradeCharacterResponse>('/characters/upgrade', {
      user_character_id: request.character_id
    });
    return response.data;
  }

  /**
   * Set active character for farming
   */
  async setActiveCharacter(request: SetActiveCharacterRequest): Promise<SetActiveCharacterResponse> {
    const response = await apiClient.post<SetActiveCharacterResponse>('/characters/set-active', {
      user_character_id: request.character_id
    });
    return response.data;
  }

  /**
   * Generate roulette items for animation
   */
//   generateRouletteItems(reward: CaseReward): Array<CaseReward & { value?: number }> {
//     const backgrounds = [
//       'linear-gradient(135deg, #ffafbd, #ffc3a0)',
//       'linear-gradient(135deg, #89f7fe, #66a6ff)',
//       'linear-gradient(135deg, #f6d365, #fda085)',
//       'linear-gradient(135deg, #84fab0, #8fd3f4)',
//       '#ffcc70',
//       'linear-gradient(135deg, #d299c2, #fef9d7)',
//       '#000000',
//       'linear-gradient(135deg, #667eea, #764ba2)',
//       'linear-gradient(135deg, #ffecd2, #fcb69f)',
//       '#d3f8e2'
//     ];

//     const dummyItems = [
//       { src: "https://em-content.zobj.net/source/telegram/386/monkey-face_1f435.webp", name: "Monkey" },
//       { src: "https://em-content.zobj.net/source/telegram/386/gorilla_1f98d.webp", name: "Gorilla" },
//       { src: "https://em-content.zobj.net/source/telegram/386/dog-face_1f436.webp", name: "Dog" },
//       { src: "https://em-content.zobj.net/source/telegram/386/cat-face_1f431.webp", name: "Cat" },
//       { src: "https://em-content.zobj.net/source/telegram/386/lion_1f981.webp", name: "Lion" },
//       { src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp", name: "Diamonds" }
//     ];

//     const rouletteItems: Array<CaseReward & { value?: number }> = [];
    
//     for (let i = 0; i < 40; i++) {
//       if (i === 19) {
//         // Winner position
//         rouletteItems.push(reward);
//         continue;
//       }

//       // Random dummy item
//       const randomItem = dummyItems[Math.floor(Math.random() * dummyItems.length)];
//       rouletteItems.push({
//         type: randomItem.name === "Diamonds" ? "diamonds" : "character",
//         name: randomItem.name,
//         src: randomItem.src,
//         is_mutated: randomItem.name !== "Diamonds" && Math.random() < 0.1,
//         background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
//         value: randomItem.name === "Diamonds" ? Math.floor(Math.random() * 250) + 1 : undefined,
//       });
//     }

//     return rouletteItems;
//   }

  /**
   * Get rarity CSS class
   */
  getRarityClass(rarity: string | undefined | null): string {
    if (!rarity) {
      return 'common';  // Значение по умолчанию
    }
    const rarityMap: Record<string, string> = {
      'common': 'common',
      'rare': 'rare',
      'epic': 'epic',
      'legendary': 'legendary',
      'premium': 'premium',
      'exclusive': 'exclusive'
    };
    return rarityMap[rarity] || 'common';
  }

  getRarityColor(rarity: string | undefined | null): string {
    if (!rarity) {
      return '#000000';  // Значение по умолчанию
    }
    const rarityMap: Record<string, string> = {
      'common': '#D3D3D3',      // Пастельно серый
      'rare': '#B8E6B8',        // Светло-зеленый
      'epic': '#D4A5A5',        // Нежно-розовый
      'legendary': '#FFD700',   // Золотистый
      'premium': '#E6B3CC',     // Пастельно-фиолетовый
      'exclusive': '#FFB347'    // Пастельно-оранжевый
    };
    return rarityMap[rarity] || '#D3D3D3';
  }

  /**
   * Get rarity label
   */
  getRarityLabel(rarity: string | undefined | null): string {
    if (!rarity) {
      return 'Common';  // Значение по умолчанию
    }
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  /**
   * Determine payment method for a case
   */
  getPaymentMethod(caseData: CaseData): 'diamonds' | 'ton' | 'free' {
    if (caseData.is_free) {
      return 'free';
    } else if (caseData.price_diamonds) {
      return 'diamonds';
    } else if (caseData.price_ton) {
      return 'ton';
    }
    return 'free';
  }

  /**
   * Format price text for display
   */
  formatPriceText(caseData: CaseData): string {
    if (caseData.is_free) {
      return 'Free';
    } else if (caseData.price_diamonds) {
      return `${caseData.price_diamonds} Diamonds`;
    } else if (caseData.price_ton) {
      return `${caseData.price_ton} TON`;
    }
    return 'Free';
  }
}

export default new ShopService(); 