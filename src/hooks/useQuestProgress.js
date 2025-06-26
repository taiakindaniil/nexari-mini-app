import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { questService } from '../api';

export const useQuestProgress = () => {
  const { playerData, coins } = useGame();

  // Track progress for clicks quest
  useEffect(() => {
    if (playerData?.totalClicks > 0) {
      questService.updateProgress('clicks', playerData.totalClicks).catch(err => {
        console.warn('Failed to update clicks progress:', err);
      });
    }
  }, [playerData?.totalClicks]);

  // Track progress for diamonds quest
  useEffect(() => {
    if (coins > 0) {
      questService.updateProgress('diamonds', coins).catch(err => {
        console.warn('Failed to update diamonds progress:', err);
      });
    }
  }, [coins]);

  // Track progress for leaderboard quest (rank)
  useEffect(() => {
    if (playerData?.rank && playerData.rank <= 10) {
      questService.updateProgress('leaderboard', playerData.rank).catch(err => {
        console.warn('Failed to update leaderboard progress:', err);
      });
    }
  }, [playerData?.rank]);
};

export default useQuestProgress; 