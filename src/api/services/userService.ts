import apiClient from '../apiClient';

export interface UserProfile {
  id: number;
  username?: string;
  full_name: string;
  avatar_url?: string;
  language_code?: string;
  created_at: string;
  is_verified: boolean;
}

export interface UserProfileUpdate {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  language_code?: string;
}

export interface SyncResponse {
  updated: boolean;
  changes: string[];
  profile: UserProfile;
}

export interface ReferralData {
  bot_username: string;
  ref_username: string;
  ref_percent: number;
  ref_invited?: number;
}

export interface ReferralResponse {
  data: ReferralData;
  success: boolean;
  message?: string;
  detail?: string;
}

/**
 * Service for handling user-related API calls
 */
class UserService {
  /**
   * Fetch the current user's profile
   * @returns Promise with user profile data
   */
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get<UserProfile>('/profile');
    return data;
  }

  /**
   * Update the user's profile
   * @param profileData - Partial profile data to update
   * @returns Promise with updated user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await apiClient.put<UserProfile>('/profile', profileData);
    return data;
  }

  /**
   * Get referral data for the current user
   * @returns Promise with referral data
   */
  async getReferralData(): Promise<ReferralResponse> {
    const { data } = await apiClient.get<ReferralResponse>('/my/referral');
    return data;
  }

  /**
   * Sync user data from Telegram with database
   * @returns Promise with sync result
   */
  async syncTelegramData(): Promise<SyncResponse> {
    const { data } = await apiClient.post<SyncResponse>('/sync-telegram');
    return data;
  }
}

export const userService = new UserService();
export default userService; 