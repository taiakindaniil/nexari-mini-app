import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { questService } from '../api';

export const useQuestProgress = () => {
  const { playerData, coins } = useGame();

  // Sync quest progress when game data changes
  useEffect(() => {
    const syncProgress = async () => {
      try {
        await questService.syncProgress();
      } catch (err) {
        console.warn('Failed to sync quest progress:', err);
      }
    };

    // Only sync if we have meaningful data
    if (playerData?.totalClicks > 0 || coins > 0) {
      syncProgress();
    }
  }, [playerData?.totalClicks, coins]);

  // Track progress for leaderboard quest (rank) - manual update since it's not in game session
  useEffect(() => {
    if (playerData?.rank && playerData.rank <= 10) {
      questService.updateProgress('leaderboard', playerData.rank).catch(err => {
        console.warn('Failed to update leaderboard progress:', err);
      });
    }
  }, [playerData?.rank]);
};

export default useQuestProgress; 