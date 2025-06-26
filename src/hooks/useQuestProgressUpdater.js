import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

/**
 * Hook for updating quest progress in real-time without API calls
 * Updates the quests state directly based on game data changes
 */
export const useQuestProgressUpdater = (quests, setQuests) => {
  const { gameStatus } = useGame();

  useEffect(() => {
    if (!quests || quests.length === 0) return;

    // Update quest progress based on current game data
    setQuests(prevQuests => 
      prevQuests.map(quest => {
        // Skip already claimed or manual quests
        if (quest.status === 'claimed' || quest.quest_type === 'telegram') {
          return quest;
        }

        let currentProgress = quest.progress_value;
        let newStatus = quest.status;

        // Update progress based on quest type
        if (quest.quest_type === 'clicks' && gameStatus?.total_clicks) {
          currentProgress = Math.max(currentProgress, gameStatus.total_clicks);
        } else if (quest.quest_type === 'diamonds' && gameStatus?.total_diamonds_earned) {
          currentProgress = Math.max(currentProgress, gameStatus.total_diamonds_earned);
        }

        // Update status based on progress
        if (quest.target_value && currentProgress >= quest.target_value) {
          if (newStatus === 'not_started' || newStatus === 'in_progress') {
            newStatus = 'completed';
          }
        } else if (currentProgress > 0 && newStatus === 'not_started') {
          newStatus = 'in_progress';
        }

        // Return updated quest if anything changed
        if (currentProgress !== quest.progress_value || newStatus !== quest.status) {
          return {
            ...quest,
            progress_value: currentProgress,
            status: newStatus,
            completed_at: newStatus === 'completed' && !quest.completed_at 
              ? new Date().toISOString() 
              : quest.completed_at
          };
        }

        return quest;
      })
    );
  }, [gameStatus?.total_clicks, gameStatus?.total_diamonds_earned, quests, setQuests]);
};

export default useQuestProgressUpdater; 