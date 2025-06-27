import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTelegramUser } from '../hooks/useTelegramUser.ts';
import { useApi } from '../api/hooks/useApi';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const telegramUser = useTelegramUser();
  const api = useApi();
  
  // Legacy state (keep for compatibility)
  const [coins, setCoins] = useState(8000);
  const [totalCoins, setTotalCoins] = useState(8000);
  const [stars, setStars] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [incomeRate, setIncomeRate] = useState(0);
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [nextIncomeTime, setNextIncomeTime] = useState(0);
  
  // New API state
  const [gameStatus, setGameStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Player data with Telegram integration
  const [player, setPlayer] = useState({
    nickname: 'Player123',
    avatar: 'https://placehold.co/40x40',
    rank: 1,
    world: 'World of Consoles'
  });

  // Update player data when Telegram user data is available
  useEffect(() => {
    if (telegramUser) {
      setPlayer(prev => ({
        ...prev,
        nickname: telegramUser.nickname,
        avatar: telegramUser.avatar,
        telegramId: telegramUser.id,
        fullName: telegramUser.fullName
      }));
    }
  }, [telegramUser]);

  // Character data
  const [selectedCharacter, setSelectedCharacter] = useState({
    src: 'https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp',
    name: 'Controller',
    level: 1,
    incomeRate: 100,
    isMutated: false,
    background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)'
  });

  // Inventory and characters
  const [inventory, setInventory] = useState([]);
  const [characters, setCharacters] = useState([]);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([
    { nickname: "Player123", coins: 8000, rank: 1 },
    { nickname: "GamerX", coins: 800, rank: 2 },
    { nickname: "CoinMaster", coins: 600, rank: 3 },
    { nickname: "DiamondKing", coins: 400, rank: 4 },
    { nickname: "CryptoStar", coins: 200, rank: 5 },
  ]);

  // API Functions - use useCallback to prevent unnecessary re-renders
  const fetchGameStatus = useCallback(async () => {
    if (!api) {
      console.warn('API not available, skipping fetchGameStatus');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.game.getStatus();
      if (response.success) {
        setGameStatus(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch game status:', err);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const startFarming = useCallback(async (characterId = null) => {
    if (!api) {
      console.warn('API not available, skipping startFarming');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.game.startFarming(characterId);
      if (response.success) {
        await fetchGameStatus(); // Refresh status
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to start farming:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchGameStatus]);

  const claimDiamonds = useCallback(async () => {
    if (!api) {
      console.warn('API not available, skipping claimDiamonds');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.game.claimDiamonds();
      if (response.success) {
        await fetchGameStatus(); // Refresh status
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to claim diamonds:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchGameStatus]);

  const setActiveCharacter = useCallback(async (userCharacterId) => {
    if (!api) {
      console.warn('API not available, skipping setActiveCharacter');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.character.setActiveCharacter(userCharacterId);
      if (response.success) {
        // Immediately update the gameStatus with the new active character
        if (response.active_character) {
          setGameStatus(prevStatus => ({
            ...prevStatus,
            active_character: response.active_character,
            // Update income rate if provided
            income_rate: response.active_character.income_rate || prevStatus.income_rate,
            // Add claimed diamonds to balance if any
            diamonds_balance: response.claimed_diamonds 
              ? (prevStatus.diamonds_balance || 0) + response.claimed_diamonds 
              : (prevStatus.diamonds_balance || 0)
          }));
        }
        
        // Still refresh status in background for consistency, but don't await it
        fetchGameStatus().catch(err => {
          console.warn('Background refresh failed:', err);
        });
        
        // Show notification if diamonds were automatically claimed
        if (response.claimed_diamonds && response.claimed_diamonds > 0) {
          const notification = document.createElement('div');
          notification.textContent = `${response.claimed_diamonds} diamonds automatically saved when switching characters!`;
          notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4caf50;
            color: #fff;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 9999;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }
        
        return response;
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to set active character:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchGameStatus]);

  // Initialize game status on mount - only when api is available
  useEffect(() => {
    if (api) {
      console.log('API available, initializing game status');
      fetchGameStatus();
    }
  }, [api, fetchGameStatus]);

  // Refresh game status every 30 seconds - only when api is available
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing game status');
      fetchGameStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [api, fetchGameStatus]);

  // Initialize inventory with default character
  useEffect(() => {
    if (inventory.length === 0) {
      const defaultCharacter = {
        id: 'controller-1',
        src: 'https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp',
        name: 'Controller',
        level: 1,
        incomeRate: 100,
        isMutated: false,
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 70%)'
      };
      setInventory([defaultCharacter]);
      setCharacters([defaultCharacter]);
      setSelectedCharacter(defaultCharacter);
    }
  }, [inventory.length]);

  // Update income rate when character changes
  useEffect(() => {
    if (selectedCharacter) {
      setIncomeRate(selectedCharacter.incomeRate || 100);
    }
  }, [selectedCharacter]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isTimerActive && nextIncomeTime > 0) {
      interval = setInterval(() => {
        const timeLeft = nextIncomeTime - Date.now();
        if (timeLeft <= 0) {
          setTimerDisplay('00:00');
          setIsTimerActive(false);
          setNextIncomeTime(0);
        } else {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setTimerDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, nextIncomeTime]);

  // Income generation
  useEffect(() => {
    let interval;
    if (isTimerActive) {
      interval = setInterval(() => {
        const incomePerSecond = incomeRate / 3600;
        setCoins(prev => prev + incomePerSecond);
        setTotalCoins(prev => prev + incomePerSecond);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, incomeRate]);

  // Functions
  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
    setTotalCoins(prev => prev + amount);
    updateLeaderboard();
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      updateLeaderboard();
      return true;
    }
    return false;
  };

  const startTimer = () => {
    setIsTimerActive(true);
    setNextIncomeTime(Date.now() + 3600000); // 1 hour
  };

  const updateLeaderboard = () => {
    setLeaderboard(prev => {
      const updated = prev.map(p => 
        p.nickname === player.nickname 
          ? { ...p, coins: Math.floor(coins) }
          : p
      );
      return updated.sort((a, b) => b.coins - a.coins).map((p, index) => ({ ...p, rank: index + 1 }));
    });
  };

  const addToInventory = (item) => {
    const newItem = {
      ...item,
      id: `${item.name.toLowerCase()}-${Date.now()}`,
      level: item.level || 1,
      incomeRate: item.incomeRate || 100,
    };
    setInventory(prev => [...prev, newItem]);
    setCharacters(prev => [...prev, newItem]);
  };

  const upgradeCharacter = (itemId) => {
    const item = inventory.find(inv => inv.id === itemId);
    if (!item || item.level >= 5) return false;
    
    const upgradeCosts = { 1: 500, 2: 1000, 3: 2000, 4: 4000 };
    const cost = upgradeCosts[item.level];
    
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      
      // Update character in inventory
      setInventory(prev => prev.map(invItem => 
        invItem.id === itemId 
          ? { ...invItem, level: invItem.level + 1, incomeRate: (invItem.level + 1) * 100 }
          : invItem
      ));
      
      // Update selected character if it's the same
      if (selectedCharacter && selectedCharacter.id === itemId) {
        setSelectedCharacter(prev => ({
          ...prev,
          level: prev.level + 1,
          incomeRate: (prev.level + 1) * 100
        }));
      }
      
      updateLeaderboard();
      return true;
    }
    return false;
  };

  const value = {
    // Legacy state
    coins,
    totalCoins,
    stars,
    currentScreen,
    incomeRate,
    timerDisplay,
    isTimerActive,
    player,
    playerData: {
      ...player,
      stars
    },
    selectedCharacter,
    inventory,
    characters,
    leaderboard,
    
    // New API state
    gameStatus,
    loading,
    error,
    
    // Actions
    setCoins,
    setStars,
    setCurrentScreen,
    setPlayer,
    addCoins,
    spendCoins,
    startTimer,
    setSelectedCharacter,
    addToInventory,
    upgradeCharacter,
    updateLeaderboard,
    
    // API Actions
    fetchGameStatus,
    startFarming,
    claimDiamonds,
    setActiveCharacter,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 