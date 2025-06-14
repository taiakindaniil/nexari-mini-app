import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function Quests() {
  const { coins, addCoins, playerData } = useGame();
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' or 'friends'
  const [questsCompleted, setQuestsCompleted] = useState({
    telegram: false,
    clicks: false,
    stars: false,
    leaderboard: false,
    diamonds: false
  });
  const [questsClaimed, setQuestsClaimed] = useState({
    telegram: false,
    clicks: false,
    stars: false,
    leaderboard: false,
    diamonds: false
  });

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const quests = [
    {
      id: 'telegram',
      icon: 'https://em-content.zobj.net/source/telegram/386/memo_1f4dd.webp',
      title: 'Subscribe to our Telegram',
      description: 'Join our community channel',
      reward: 50,
      link: 'https://t.me/nexari_community',
      condition: () => questsCompleted.telegram
    },
    {
      id: 'clicks',
      icon: 'https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp',
      title: 'Click the controller 50 times',
      description: 'Make 50 clicks on the character',
      reward: 150,
      condition: () => playerData.totalClicks >= 50
    },
    {
      id: 'stars',
      icon: 'https://em-content.zobj.net/source/telegram/386/star_2b50.webp',
      title: 'Earn 100 Stars',
      description: 'Collect 100 stars in total',
      reward: 200,
      condition: () => playerData.stars >= 100
    },
    {
      id: 'leaderboard',
      icon: 'https://em-content.zobj.net/source/telegram/386/trophy_1f3c6.webp',
      title: 'Reach Top 10 in Leaderboard',
      description: 'Get into top 10 players',
      reward: 500,
      condition: () => playerData.rank <= 10
    },
    {
      id: 'diamonds',
      icon: 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp',
      title: 'Collect 3000 Diamonds',
      description: 'Accumulate 3000 diamonds',
      reward: 100,
      condition: () => coins >= 3000
    }
  ];

  useEffect(() => {
    // Check quest completion status
    const newCompleted = {};
    quests.forEach(quest => {
      newCompleted[quest.id] = quest.condition();
    });
    setQuestsCompleted(newCompleted);
  }, [coins, playerData]);

  const handleTelegramClick = () => {
    window.open('https://t.me/nexari_community', '_blank');
    setQuestsCompleted(prev => ({ ...prev, telegram: true }));
  };

  const handleClaimReward = (questId, reward) => {
    if (questsClaimed[questId] || !questsCompleted[questId]) return;
    
    addCoins(reward);
    setQuestsClaimed(prev => ({ ...prev, [questId]: true }));
    
    // Show notification
    showNotification('Награда получена!');
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      color: #fff;
      padding: 1rem;
      border-radius: 12px;
      z-index: 9999;
      font-weight: 600;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const copyInviteLink = () => {
    const inviteLink = 'https://t.me/nexari_bot?start=ref123';
    navigator.clipboard.writeText(inviteLink).then(() => {
      showNotification('Ссылка скопирована');
    });
  };

  return (
    <div className="shop-container visible">
      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button 
          className={`tab-button ${activeTab === 'quests' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('quests')}
        >
          <span className="tab-icon">🎯</span>
          Quests
        </button>
        <button 
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('friends')}
        >
          <span className="tab-icon">👥</span>
          Friends
        </button>
      </div>

      {/* Quests Content */}
      {activeTab === 'quests' && (
        <div className="cases-content">
          <div className="cases-grid">
            {quests.map((quest) => (
              <div key={quest.id} className="case-container">
                <img className="case-image" src={quest.icon} alt={quest.title} />
                <div className="case-name">
                  {quest.id === 'telegram' ? (
                    <>
                      Subscribe to our{' '}
                      <a 
                        href={quest.link}
                        onClick={handleTelegramClick}
                        style={{ color: '#4fc3f7', textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Telegram
                      </a>
                    </>
                  ) : (
                    quest.title
                  )}
                </div>
                <div className="case-price">
                  <button 
                    className={`quest-claim-button ${
                      questsClaimed[quest.id] 
                        ? 'claimed' 
                        : questsCompleted[quest.id] 
                          ? 'ready' 
                          : 'locked'
                    }`}
                    disabled={!questsCompleted[quest.id] || questsClaimed[quest.id]}
                    onClick={() => handleClaimReward(quest.id, quest.reward)}
                  >
                    {questsClaimed[quest.id] ? (
                      <>
                        <span className="button-icon">✓</span>
                        Claimed
                      </>
                    ) : (
                      <>
                        <span className="button-icon">💎</span>
                        Claim {quest.reward}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Content */}
      {activeTab === 'friends' && (
        <div className="inventory-content">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem', 
            padding: '2rem 1rem',
            minHeight: '300px',
            justifyContent: 'center'
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem' 
            }}>
              👥
            </div>
            <button 
              onClick={copyInviteLink}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#fff',
                color: '#000',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Copy Invite Link
            </button>
            <div style={{ 
              fontSize: '1.2rem', 
              color: '#0ff', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 255, 255, 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: '8px'
            }}>
              +200 
              <img 
                src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
                style={{ width: '20px', height: '20px' }}
                alt="Diamond"
              />
              per friend
            </div>
            <div style={{ 
              color: '#888',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              No friends yet<br/>
              Invite friends to earn diamonds!
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 