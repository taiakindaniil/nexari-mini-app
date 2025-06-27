import apiClient from '../apiClient';

export interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  referral_code: string;
  invite_link: string;
}

export interface ReferralUser {
  id: number;
  username?: string;
  full_name: string;
  avatar_url?: string;
  joined_at: string;
  earned_diamonds: number;
}

export interface ReferralListResponse {
  stats: ReferralStats;
  recent_referrals: ReferralUser[];
}

export interface ClaimRewardsResponse {
  success: boolean;
  message: string;
  rewards_claimed?: number;
  referrals_count?: number;
  new_balance?: number;
}

/**
 * Service for handling referral-related API calls
 */
class ReferralService {
  /**
   * Get referral statistics
   * @returns Promise with referral stats
   */
  async getStats(): Promise<ReferralStats> {
    const { data } = await apiClient.get<ReferralStats>('/referral/stats');
    return data;
  }

  /**
   * Get referral list with recent referrals
   * @returns Promise with referral list and stats
   */
  async getList(): Promise<ReferralListResponse> {
    const { data } = await apiClient.get<ReferralListResponse>('/referral/list');
    return data;
  }

  /**
   * Claim referral rewards
   * @returns Promise with claim result
   */
  async claimRewards(): Promise<ClaimRewardsResponse> {
    const { data } = await apiClient.post<ClaimRewardsResponse>('/referral/claim-rewards');
    return data;
  }
}

// Export singleton instance
const referralService = new ReferralService();
export default referralService; 