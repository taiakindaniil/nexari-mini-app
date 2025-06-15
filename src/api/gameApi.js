import { config, mockInitData } from '../config';

const API_BASE_URL = config.API_URL;

class GameAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get Telegram WebApp init data for authentication
    let initData = window.Telegram?.WebApp?.initData || '';
    
    // Use mock data in development if no real data available
    if (config.DEVELOPMENT && !initData) {
      initData = mockInitData;
      console.log('Using mock auth data for development');
    }
    
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `tma ${initData}`,
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Game status and farming
  async getGameStatus() {
    return this.makeRequest('/game/status');
  }

  async startFarming(characterId = null) {
    return this.makeRequest('/game/start-farming', {
      method: 'POST',
      body: { character_id: characterId },
    });
  }

  async claimDiamonds() {
    return this.makeRequest('/game/claim-diamonds', {
      method: 'POST',
    });
  }

  async incrementClicks() {
    return this.makeRequest('/game/click', {
      method: 'POST',
    });
  }

  // Characters
  async getShopCharacters() {
    return this.makeRequest('/characters/shop');
  }

  async getUserInventory() {
    return this.makeRequest('/characters/inventory');
  }

  async purchaseCharacter(characterId) {
    return this.makeRequest('/characters/purchase', {
      method: 'POST',
      body: { character_id: characterId },
    });
  }

  async upgradeCharacter(userCharacterId) {
    return this.makeRequest('/characters/upgrade', {
      method: 'POST',
      body: { user_character_id: userCharacterId },
    });
  }

  async setActiveCharacter(userCharacterId) {
    return this.makeRequest('/characters/set-active', {
      method: 'POST',
      body: { user_character_id: userCharacterId },
    });
  }

  async getCharacterDetails(userCharacterId) {
    return this.makeRequest(`/characters/${userCharacterId}`);
  }
}

export const gameAPI = new GameAPI(); 