import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { 
    stars,
    gameStatus, 
    loading, 
    error, 
    startFarming, 
    claimDiamonds,
    fetchGameStatus 
  } = useGame();
  
  const [characterScale, setCharacterScale] = useState(1);
  const [scaleTimeout, setScaleTimeout] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  // Improved time formatting
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Get time label based on remaining time
  const getTimeLabel = (seconds) => {
    if (!seconds || seconds <= 0) return 'tap to start';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return 'remaining';
    } else if (minutes > 0) {
      return 'remaining';
    } else {
      return 'finishing';
    }
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
      console.error('Claim diamonds error:', error);
      
      // More user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message.includes('Suspicious activity detected')) {
        errorMessage = 'Please wait a moment before trying again. The system detected unusual activity.';
      } else if (error.message.includes('farming not started')) {
        errorMessage = 'Farming has been started. Please wait a moment and try again.';
      } else if (error.message.includes('income rate is 0')) {
        errorMessage = 'Please select a character to start earning diamonds.';
      } else if (error.message.includes('farming time:')) {
        errorMessage = 'Not enough time has passed since farming started. Please wait a bit longer.';
      } else if (error.message.includes('Farming started')) {
        errorMessage = 'Farming has been started! Please wait a moment and try again.';
        // Auto-refresh status after starting farming
        setTimeout(() => {
          fetchGameStatus();
        }, 2000);
      } else if (error.message.includes('wait at least 1 minute')) {
        errorMessage = 'Please wait at least 1 minute before claiming diamonds.';
      }
      
      alert(`Failed to claim diamonds: ${errorMessage}`);
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
      {/* Three Info Blocks at Top */}
      <div className="info-blocks-container">
        {/* Farming Rate Block */}
        <div className="info-block farming-block">
          <div className="info-icon">💎</div>
          <div className="info-content">
            <div className="info-value">{gameStatus?.income_rate || 0}</div>
            <div className="info-label">per hour</div>
          </div>
        </div>
        
        {/* Timer Block */}
        <div className="info-block timer-block">
          <div className="info-icon">⏱️</div>
          <div className="info-content">
            {gameStatus?.farming_active ? (
              <>
                <div className="info-value">{formatTime(gameStatus.time_remaining)}</div>
                <div className="info-label">{getTimeLabel(gameStatus.time_remaining)}</div>
              </>
            ) : (
              <>
                <div className="info-value">--:--</div>
                <div className="info-label">tap to start</div>
              </>
            )}
          </div>
        </div>
        
        {/* Boost Block */}
        <div className="info-block boost-block" onClick={handleX4Click}>
          <div className="info-icon">⚡</div>
          <div className="info-content">
            <div className="info-value">x4</div>
            <div className="info-label">boost</div>
          </div>
        </div>
      </div>
      
      {/* Stars Display */}
      <div className="stars-display-top" onClick={handleStarDonationClick}>
        <span>⭐ {stars}</span>
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
      
      {/* Premium Claim Button Above Footer */}
      {gameStatus?.pending_diamonds > 0 && (
        <div className="claim-section-bottom">
          <button 
            className={`claim-button-premium ${claimLoading ? 'loading' : ''}`}
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
                <div className="claim-content">
                  <span className="claim-text">Claim Reward</span>
                  <span className="claim-amount">+{gameStatus.pending_diamonds} 💎</span>
                </div>
                <div className="claim-arrow">→</div>
              </>
            )}
          </button>
        </div>
      )}
      
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