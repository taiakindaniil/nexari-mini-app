import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { questService } from '../api';

export const useQuestProgress = () => {
  const { playerData, coins } = useGame();

  // Track progress for clicks quest
  useEffect(() => {
    if (playerData?.totalClicks > 0) {
      questService.updateProgress('clicks', playerData.totalClicks).catch(console.error);
    }
  }, [playerData?.totalClicks]);

  // Track progress for stars quest
  useEffect(() => {
    if (playerData?.stars > 0) {
      questService.updateProgress('stars', playerData.stars).catch(console.error);
    }
  }, [playerData?.stars]);

  // Track progress for diamonds quest
  useEffect(() => {
    if (coins > 0) {
      questService.updateProgress('diamonds', coins).catch(console.error);
    }
  }, [coins]);

  // Track progress for leaderboard quest (rank)
  useEffect(() => {
    if (playerData?.rank && playerData.rank <= 10) {
      questService.updateProgress('leaderboard', playerData.rank).catch(console.error);
    }
  }, [playerData?.rank]);
};

export default useQuestProgress; 