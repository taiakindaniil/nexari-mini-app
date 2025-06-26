import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { questService } from '../api';

export const useQuestProgress = () => {
  const { gameStatus, player } = useGame();

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
    if (gameStatus?.total_clicks > 0 || gameStatus?.total_diamonds_earned > 0) {
      syncProgress();
    }
  }, [gameStatus?.total_clicks, gameStatus?.total_diamonds_earned]);

  // Track progress for leaderboard quest (rank) - manual update since it's not in game session
  useEffect(() => {
    if (player?.rank && player.rank <= 10) {
      questService.updateProgress('leaderboard', player.rank).catch(err => {
        console.warn('Failed to update leaderboard progress:', err);
      });
    }
  }, [player?.rank]);
};

export default useQuestProgress; 