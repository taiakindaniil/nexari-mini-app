import apiClient from '../apiClient.ts';

export interface GameStatus {
  diamonds_balance: number;
  pending_diamonds: number;
  income_rate: number;
  farming_active: boolean;
  time_remaining: number;
  active_character: {
    id: number;
    name: string;
    level: number;
    image_url: string;
    income_rate: number;
  } | null;
}

export interface StartFarmingRequest {
  character_id?: number;
}

export interface StartFarmingResponse {
  success: boolean;
  farming_start_time?: string;
  income_rate?: number;
  character_id?: number;
  error?: string;
}

export interface ClaimDiamondsResponse {
  success: boolean;
  claimed_diamonds?: number;
  total_balance?: number;
  income_rate?: number;
  error?: string;
}



export interface GameStatusResponse {
  success: boolean;
  data: GameStatus;
}

/**
 * Service for handling game-related API calls
 */
class GameService {
  /**
   * Get current game status for user
   */
  async getStatus(): Promise<GameStatusResponse> {
    const response = await apiClient.get('/game/status');
    return response.data;
  }

  /**
   * Start farming with selected character
   */
  async startFarming(characterId?: number): Promise<StartFarmingResponse> {
    const response = await apiClient.post('/game/start-farming', {
      character_id: characterId
    });
    return response.data;
  }

  /**
   * Claim accumulated diamonds
   */
  async claimDiamonds(): Promise<ClaimDiamondsResponse> {
    const response = await apiClient.post('/game/claim-diamonds');
    return response.data;
  }


}

export default new GameService();
