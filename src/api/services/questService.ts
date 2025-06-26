import apiClient from '../apiClient';

export interface Quest {
  id: number;
  quest_type: string;
  title: string;
  description: string;
  reward_amount: number;
  icon_url?: string;
  target_value?: number;
  link_url?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'claimed';
  progress_value: number;
  completed_at?: string;
  claimed_at?: string;
}

export interface QuestListResponse {
  quests: Quest[];
}

export interface QuestClaimResponse {
  success: boolean;
  message: string;
  reward_amount: number;
  new_balance: number;
}

export interface QuestProgressRequest {
  quest_type: string;
  progress_value: number;
}

class QuestService {
  private basePath = '/quest';

  /**
   * Get all quests with user progress
   */
  async getQuests(): Promise<QuestListResponse> {
    const response = await apiClient.get(`${this.basePath}/list`);
    return response.data;
  }

  /**
   * Claim quest reward
   */
  async claimReward(questId: number): Promise<QuestClaimResponse> {
    const response = await apiClient.post(`${this.basePath}/claim`, {
      quest_id: questId
    });
    return response.data;
  }

  /**
   * Verify telegram subscription quest
   */
  async verifyTelegramQuest(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.basePath}/telegram-verify`);
    return response.data;
  }

  /**
   * Update quest progress manually
   */
  async updateProgress(questType: string, progressValue: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.basePath}/update-progress`, {
      quest_type: questType,
      progress_value: progressValue
    });
    return response.data;
  }

  /**
   * Sync quest progress with game data
   */
  async syncProgress(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.basePath}/sync-progress`);
    return response.data;
  }
}

const questService = new QuestService();
export default questService; 