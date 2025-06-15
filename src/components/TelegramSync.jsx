import { useEffect } from 'react';
import { useTelegramSync } from '../hooks/useTelegramSync';
import { useGame } from '../context/GameContext';

const TelegramSync = () => {
  const { profile, loading, error, syncResult, getPlayerData } = useTelegramSync();
  const { setPlayer } = useGame();

  useEffect(() => {
    if (profile && getPlayerData) {
      const playerData = getPlayerData();
      
      if (playerData && setPlayer) {
        if (import.meta.env.DEV) {
          console.log('Updating player data from sync:', playerData);
        }
        
        setPlayer(prev => ({
          ...prev,
          nickname: playerData.nickname,
          avatar: playerData.avatar,
          telegramId: playerData.telegramId,
          fullName: playerData.fullName,
          username: playerData.username,
          languageCode: playerData.languageCode
        }));
      }
    }
  }, [profile, getPlayerData, setPlayer]);

  // Логируем результат синхронизации только в режиме разработки
  useEffect(() => {
    if (syncResult && import.meta.env.DEV) {
      if (syncResult.updated) {
        console.log(`Profile synced with updates: ${syncResult.changes.join(', ')}`);
      } else {
        console.log('Profile synced - no changes needed');
      }
    }
  }, [syncResult]);

  // Тихое логирование состояний только в режиме разработки
  if (loading && import.meta.env.DEV) {
    console.log('Syncing user data...');
  }

  if (error) {
    console.error('User sync error:', error);
  }

  // Этот компонент работает в фоне и ничего не отображает
  return null;
};

export default TelegramSync; 