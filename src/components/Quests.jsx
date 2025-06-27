import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { questService, referralService } from '../api';
import { useQuestProgressUpdater } from '../hooks/useQuestProgressUpdater';

export default function Quests() {
  const { addCoins, player } = useGame();
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' or 'friends'
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingQuests, setClaimingQuests] = useState(new Set());
  
  // Referral state
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  // Use the quest progress updater hook
  useQuestProgressUpdater(quests, setQuests);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    
    // Load referral data when switching to friends tab
    if (tab === 'friends' && !referralData) {
      loadReferralData();
    }
  };

  // Load quests from API
  const loadQuests = async () => {
    try {
      setLoading(true);
      const response = await questService.getQuests();
      setQuests(response.quests);
      setError(null);
    } catch (err) {
      console.error('Error loading quests:', err);
      setError('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  // Load referral data from API
  const loadReferralData = async () => {
    try {
      setReferralLoading(true);
      const response = await referralService.getList();
      setReferralData(response);
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setReferralLoading(false);
    }
  };

  useEffect(() => {
    loadQuests();
  }, []);

  // Optional: Refresh quests when switching to quests tab (only if quests array is empty)
  useEffect(() => {
    if (activeTab === 'quests' && quests.length === 0 && !loading) {
      loadQuests();
    }
  }, [activeTab]);

  const handleTelegramClick = async (quest) => {
    window.open(quest.link_url || 'https://t.me/nexari_community', '_blank');
    
    try {
      await questService.verifyTelegramQuest();
      
      // Update only the telegram quest instead of reloading all
      setQuests(prevQuests => 
        prevQuests.map(q => 
          q.quest_type === 'telegram' 
            ? { 
                ...q, 
                status: 'completed', 
                progress_value: 1,
                completed_at: new Date().toISOString() 
              }
            : q
        )
      );
      
      showNotification('Telegram quest verified!');
    } catch (err) {
      console.error('Error verifying telegram quest:', err);
    }
  };

  const handleClaimReward = async (quest) => {
    if (quest.status !== 'completed' || claimingQuests.has(quest.id)) return;
    
    setClaimingQuests(prev => new Set(prev).add(quest.id));
    
    try {
      const response = await questService.claimReward(quest.id);
      addCoins(response.reward_amount);
      
      // Update only the specific quest instead of reloading all
      setQuests(prevQuests => 
        prevQuests.map(q => 
          q.id === quest.id 
            ? { ...q, status: 'claimed', claimed_at: new Date().toISOString() }
            : q
        )
      );
      
      showNotification('Награда получена!');
    } catch (err) {
      console.error('Error claiming reward:', err);
      showNotification('Ошибка при получении награды');
    } finally {
      setClaimingQuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(quest.id);
        return newSet;
      });
    }
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
          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '300px',
              fontSize: '1.2rem',
              color: '#888'
            }}>
              Loading quests...
            </div>
          ) : error ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '300px',
              fontSize: '1.2rem',
              color: '#ff6b6b'
            }}>
              {error}
            </div>
          ) : (
            <div className="cases-grid">
              {quests.map((quest) => (
                <div key={quest.id} className="case-container">
                  <img 
                    className="case-image" 
                    src={quest.icon_url || 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp'} 
                    alt={quest.title} 
                  />
                  <div className="case-name">
                    {quest.quest_type === 'telegram' ? (
                      <>
                        <a 
                          href={quest.link_url}
                          onClick={(e) => {
                            e.preventDefault();
                            handleTelegramClick(quest);
                          }}
                          style={{ color: '#4fc3f7', textDecoration: 'none', cursor: 'pointer' }}
                        >
                          {quest.title}
                        </a>
                      </>
                    ) : (
                      quest.title
                    )}
                  </div>
                  <div className="case-description" style={{ 
                    fontSize: '0.8rem', 
                    color: '#888', 
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                  }}>
                    {quest.description}
                    {quest.target_value && (
                      <div style={{ marginTop: '0.25rem', color: '#4fc3f7' }}>
                        Progress: {quest.progress_value}/{quest.target_value}
                      </div>
                    )}
                  </div>
                  <div className="case-price">
                    <button 
                      className={`quest-claim-button ${
                        quest.status === 'claimed' 
                          ? 'claimed' 
                          : quest.status === 'completed' 
                            ? 'ready' 
                            : 'locked'
                      }`}
                      disabled={quest.status !== 'completed' || claimingQuests.has(quest.id)}
                      onClick={() => handleClaimReward(quest)}
                    >
                      {quest.status === 'claimed' ? (
                        <>
                          <span className="button-icon">✓</span>
                          Claimed
                        </>
                      ) : claimingQuests.has(quest.id) ? (
                        <>
                          <span className="button-icon">⏳</span>
                          Claiming...
                        </>
                      ) : (
                        <>
                          <span className="button-icon">💎</span>
                          Claim {quest.reward_amount}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friends Content */}
      {activeTab === 'friends' && (
        <div className="inventory-content">
          {referralLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '300px',
              fontSize: '1.2rem',
              color: '#888'
            }}>
              Loading referrals...
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {/* Referral Stats */}
              <div style={{ 
                background: 'rgba(0, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0ff', marginBottom: '0.5rem' }}>
                  {referralData?.stats.total_referrals || 0} Friends
                </div>
                <div style={{ fontSize: '1rem', color: '#888', marginBottom: '1rem' }}>
                  Total earned: {referralData?.stats.total_earned || 0} 💎
                </div>
                <button 
                  onClick={() => {
                    const inviteLink = referralData?.stats.invite_link || `https://t.me/nexari_app_bot?start=ref_${player.username || player.telegramId || 'ref123'}`;
                    navigator.clipboard.writeText(inviteLink).then(() => {
                      showNotification('Invite link copied!');
                    });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#0ff',
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
                  fontSize: '1rem', 
                  color: '#0ff', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  +200 
                  <img 
                    src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
                    style={{ width: '20px', height: '20px' }}
                    alt="Diamond"
                  />
                  per friend
                </div>
              </div>

              {/* Recent Friends List */}
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  Recent Friends ({referralData?.recent_referrals?.length || 0})
                </h3>
                {referralData?.recent_referrals?.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {referralData.recent_referrals.map((friend) => (
                      <div key={friend.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: friend.avatar_url ? `url(${friend.avatar_url})` : '#333',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '1.2rem'
                        }}>
                          {!friend.avatar_url && '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontWeight: '600' }}>
                            {friend.username ? `@${friend.username}` : friend.full_name}
                          </div>
                          <div style={{ color: '#888', fontSize: '0.8rem' }}>
                            Joined: {new Date(friend.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ 
                          color: '#0ff', 
                          fontSize: '0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {friend.earned_diamonds} 💎
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    color: '#888',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    padding: '2rem'
                  }}>
                    No friends yet<br/>
                    Share your invite link to earn diamonds!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 