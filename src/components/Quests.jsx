import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function Quests() {
  const { coins, addCoins, playerData } = useGame();
  const [showingFriends, setShowingFriends] = useState(false);
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

  const toggleView = () => {
    setShowingFriends(!showingFriends);
  };

  if (showingFriends) {
    return (
      <div className="leaderboard-container visible">
        <div className="leaderboard-title">Friends</div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1rem' 
        }}>
          <button 
            onClick={copyInviteLink}
            style={{
              padding: '0.5rem 1rem',
              background: '#fff',
              color: '#000',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
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
            gap: '0.5rem'
          }}>
            +200 
            <img 
              src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
              style={{ width: '20px', height: '20px' }}
              alt="Diamond"
            />
          </div>
          <div style={{ color: '#888' }}>No friends yet</div>
        </div>
        
        {/* Navigation arrows */}
        <div className="quests-arrow left" onClick={toggleView}>
          &lt;
        </div>
        <div className="quests-arrow right" onClick={toggleView}>
          &gt;
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container visible">
      <div className="leaderboard-title">Quests</div>
      <div className="leaderboard-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                className={`claim-button ${questsCompleted[quest.id] && !questsClaimed[quest.id] ? 'pulse' : ''}`}
                disabled={!questsCompleted[quest.id] || questsClaimed[quest.id]}
                onClick={() => handleClaimReward(quest.id, quest.reward)}
                style={{
                  opacity: questsClaimed[quest.id] ? 0.5 : 1,
                  cursor: questsClaimed[quest.id] ? 'not-allowed' : 'pointer'
                }}
              >
                {questsClaimed[quest.id] ? 'Claimed' : (
                  <>
                    Claim {quest.reward}{' '}
                    <img 
                      src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
                      style={{ width: '16px', height: '16px' }}
                      alt="Diamond"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      <div className="quests-arrow left" onClick={toggleView}>
        &lt;
      </div>
      <div className="quests-arrow right" onClick={toggleView}>
        &gt;
      </div>
    </div>
  );
} 