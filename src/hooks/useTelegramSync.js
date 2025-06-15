import { useState, useEffect } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useApi } from '../api/hooks/useApi';

export const useTelegramSync = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  // Use the useApi hook to ensure proper authentication
  const api = useApi();

  const syncTelegramData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Синхронизируем данные из Telegram с базой
      const result = await api.user.syncTelegramData();
      setSyncResult(result);
      setProfile(result.profile);
      
      if (import.meta.env.DEV) {
        console.log('User sync result:', result);
      }
      
      return result;
    } catch (err) {
      console.error('Error syncing Telegram data:', err);
      setError(err.message || 'Failed to sync Telegram data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await api.user.getProfile();
      setProfile(profileData);
      
      return profileData;
    } catch (err) {
      console.error('Error getting profile:', err);
      setError(err.message || 'Failed to get profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProfile = await api.user.updateProfile(updates);
      setProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Автоматическая синхронизация при каждом заходе в приложение
  useEffect(() => {
    const autoSync = async () => {
      try {
        // Всегда пытаемся синхронизировать данные из Telegram
        const launchParams = retrieveLaunchParams();
        if (launchParams && launchParams.initData && launchParams.initData.user) {
          // Синхронизируем данные из Telegram с базой
          await syncTelegramData();
        } else {
          // Если нет данных Telegram, просто загружаем профиль из базы
          await getProfile();
        }
      } catch (err) {
        console.error('Auto sync failed:', err);
        // В случае ошибки все равно пытаемся загрузить профиль
        try {
          await getProfile();
        } catch (profileErr) {
          console.error('Failed to load profile:', profileErr);
        }
      }
    };

    // Only run auto sync when the api is available
    if (api) {
      autoSync();
    }
  }, [api]);

  return {
    profile,
    loading,
    error,
    syncResult,
    syncTelegramData,
    getProfile,
    updateProfile,
    // Утилиты для получения данных игрока
    getPlayerData: () => {
      if (!profile) return null;
      
      return {
        id: profile.id,
        nickname: profile.username || profile.full_name || 'User',
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=007acc&color=fff&size=128`,
        fullName: profile.full_name,
        username: profile.username,
        languageCode: profile.language_code,
        telegramId: profile.id
      };
    }
  };
}; 