import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useGameAPI } from '../hooks/useGameAPI';

export default function Home() {
  const { 
    stars
  } = useGame();
  
  const { 
    gameStatus, 
    loading, 
    error, 
    startFarming, 
    claimDiamonds 
  } = useGameAPI();
  
  const [characterScale, setCharacterScale] = useState(1);
  const [scaleTimeout, setScaleTimeout] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  // Format time display
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCharacterClick = async () => {
    // Start farming if not active
    if (gameStatus && !gameStatus.farming_active) {
      try {
        await startFarming();
      } catch (error) {
        console.error('Failed to start farming:', error);
      }
    }

    // Scale animation
    setCharacterScale(Math.min(characterScale + 0.1, 1.4));
    
    // Reset scale after 1 second
    if (scaleTimeout) clearTimeout(scaleTimeout);
    const timeout = setTimeout(() => {
      setCharacterScale(1);
    }, 1000);
    setScaleTimeout(timeout);
  };

  const handleClaimClick = async () => {
    if (!gameStatus?.pending_diamonds || gameStatus.pending_diamonds <= 0 || claimLoading) return;
    
    try {
      setClaimLoading(true);
      const result = await claimDiamonds();
      if (result.success) {
        // Show success message or animation
        console.log(`Claimed ${result.claimed_diamonds} diamonds!`);
      }
    } catch (error) {
      alert(`Failed to claim diamonds: ${error.message}`);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleX4Click = () => {
    alert('x4 boost upgrade coming soon!');
  };

  const handleStarDonationClick = () => {
    alert('Donation modal coming soon!');
  };

  // Show loading state
  if (loading && !gameStatus) {
    return (
      <div className="home-content">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !gameStatus) {
    return (
      <div className="home-content">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Error loading game data: {error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-content">
      {/* Mining Rate Display */}
      <div className="mining-display">
        <div className="mining-rate">
          <div className="mining-icon">💎</div>
          <div className="mining-info">
            <div className="mining-value">{gameStatus?.income_rate || 0}</div>
            <div className="mining-label">Diamonds/hour</div>
          </div>
        </div>
        
        {/* Mining Timer */}
        <div className="mining-timer">
          {gameStatus?.farming_active ? (
            <div className="timer-active">
              <div className="timer-icon">⏱️</div>
              <div className="timer-info">
                <div className="timer-value">{formatTime(gameStatus.time_remaining)}</div>
                <div className="timer-label">Time remaining</div>
              </div>
              <button 
                className="boost-button"
                onClick={handleX4Click}
                title="4x boost upgrade"
              >
                ⚡ x4
              </button>
            </div>
          ) : (
            <div className="timer-inactive">
              <div className="start-message">Click character to start mining!</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Balance and Claim Section */}
      <div className="balance-section">
        <div className="balance-display">
          <div className="balance-icon">💎</div>
          <div className="balance-value">{Math.floor(gameStatus?.diamonds_balance || 0)}</div>
        </div>
        
        {/* Claim Button */}
        {gameStatus?.pending_diamonds > 0 && (
          <button 
            className={`claim-button ${claimLoading ? 'loading' : ''}`}
            onClick={handleClaimClick}
            disabled={claimLoading}
          >
            {claimLoading ? (
              <>
                <div className="claim-spinner"></div>
                <span>Claiming...</span>
              </>
            ) : (
              <>
                <span>Claim +{gameStatus.pending_diamonds}</span>
                <div className="claim-icon">💎</div>
              </>
            )}
          </button>
        )}
        
        {/* Stars Display */}
        <div className="stars-display" onClick={handleStarDonationClick}>
          <div className="stars-icon">⭐</div>
          <div className="stars-value">{stars}</div>
        </div>
      </div>
      
      {/* Character Container */}
      <div className="character-container">
        {gameStatus?.active_character ? (
          <div className="character-wrapper">
            <img 
              alt={gameStatus.active_character.name} 
              className="character" 
              src={gameStatus.active_character.image_url}
              onClick={handleCharacterClick}
              style={{
                transform: `scale(${characterScale})`,
                transition: 'transform 0.3s ease'
              }}
              title={`${gameStatus.active_character.name} (Level ${gameStatus.active_character.level})`}
            />
            {gameStatus.farming_active && (
              <div className="mining-effect">
                <div className="mining-particle"></div>
                <div className="mining-particle"></div>
                <div className="mining-particle"></div>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="character placeholder"
            onClick={handleCharacterClick}
            style={{
              width: '150px',
              height: '150px',
              backgroundColor: '#333',
              border: '2px dashed #666',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: `scale(${characterScale})`,
              transition: 'transform 0.3s ease'
            }}
          >
            <span style={{ color: '#999' }}>No Character</span>
          </div>
        )}
      </div>
      
      {/* Debug info in development */}
      {import.meta.env.DEV && gameStatus && (
        <div className="debug-info">
          <div>Farming: {gameStatus.farming_active ? 'Active' : 'Inactive'}</div>
          <div>Pending: {gameStatus.pending_diamonds}</div>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>Error: {error}</div>}
        </div>
      )}
    </div>
  );
} 