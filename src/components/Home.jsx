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
    claimDiamonds, 
    incrementClicks 
  } = useGameAPI();
  
  const [characterScale, setCharacterScale] = useState(1);
  const [scaleTimeout, setScaleTimeout] = useState(null);

  // Format time display
  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCharacterClick = async () => {
    // Increment click counter for quests
    await incrementClicks();
    
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
    if (!gameStatus?.pending_diamonds || gameStatus.pending_diamonds <= 0) return;
    
    try {
      const result = await claimDiamonds();
      if (result.success) {
        // Show success message or animation
        console.log(`Claimed ${result.claimed_diamonds} diamonds!`);
      }
    } catch (error) {
      alert(`Failed to claim diamonds: ${error.message}`);
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
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !gameStatus) {
    return (
      <div className="home-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Error loading game data: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-content">
      <div className="income-counter">
        <span>{gameStatus?.income_rate || 0}</span> Diamonds/h
        <img alt="Gem Stone" className="gem-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
      </div>
      
      <div className="income-timer">
        {gameStatus?.farming_active ? (
          <>
            <span>{formatTime(gameStatus.time_remaining)}</span>
            <span 
              onClick={handleX4Click}
              style={{marginLeft: 8, fontWeight: 'bold', color: 'gold', cursor: 'pointer'}}
            >
              x4
            </span>
          </>
        ) : (
          <span>Click character to start farming!</span>
        )}
      </div>
      
      <div className="coin-counter visible">
        <span>{Math.floor(gameStatus?.diamonds_balance || 0)}</span>
        <img alt="Gem Stone" className="coin-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
        
        {/* Claim button for pending diamonds */}
        {gameStatus?.pending_diamonds > 0 && (
          <button 
            onClick={handleClaimClick}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: 'gold',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Claim +{gameStatus.pending_diamonds}
          </button>
        )}
        
        <div className="donation-line" onClick={handleStarDonationClick} style={{cursor: 'pointer'}}>
          <span>{stars}</span>
          <img alt="Star" src="https://em-content.zobj.net/source/telegram/386/star_2b50.webp" style={{width: 24, height: 24, verticalAlign: 'middle'}} />
        </div>
      </div>
      
      <div className="character-container">
        {gameStatus?.active_character ? (
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
        <div style={{ 
          position: 'fixed', 
          bottom: '100px', 
          left: '10px', 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '10px', 
          fontSize: '12px',
          borderRadius: '5px',
          maxWidth: '200px'
        }}>
          <div>Clicks: {gameStatus.total_clicks}</div>
          <div>Farming: {gameStatus.farming_active ? 'Active' : 'Inactive'}</div>
          <div>Pending: {gameStatus.pending_diamonds}</div>
          {loading && <div>Loading...</div>}
          {error && <div style={{color: 'red'}}>Error: {error}</div>}
        </div>
      )}
    </div>
  );
} 