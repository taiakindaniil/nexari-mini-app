import apiClient from '../apiClient';

export interface GameStatus {
  diamonds_balance: number;
  pending_diamonds: number;
  income_rate: number;
  farming_active: boolean;
  time_remaining: number;
  total_clicks: number;
  active_character?: {
    id: number;
    name: string;
    level: number;
    image_url: string;
    income_rate: number;
  };
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

export interface ClickResponse {
  success: boolean;
  total_clicks: number;
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
    const { data } = await apiClient.get<GameStatusResponse>('/game/status');
    return data;
  }

  /**
   * Start farming with selected character
   */
  async startFarming(characterId?: number): Promise<StartFarmingResponse> {
    const { data } = await apiClient.post<StartFarmingResponse>('/game/start-farming', {
      character_id: characterId,
    });
    return data;
  }

  /**
   * Claim accumulated diamonds
   */
  async claimDiamonds(): Promise<ClaimDiamondsResponse> {
    const { data } = await apiClient.post<ClaimDiamondsResponse>('/game/claim-diamonds');
    return data;
  }

  /**
   * Increment click counter for quests
   */
  async incrementClicks(): Promise<ClickResponse> {
    const { data } = await apiClient.post<ClickResponse>('/game/click');
    return data;
  }
}

export const gameService = new GameService();
export default gameService;
