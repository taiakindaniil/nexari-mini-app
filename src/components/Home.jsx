import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { 
    coins, 
    stars, 
    incomeRate, 
    timerDisplay, 
    selectedCharacter, 
    startTimer, 
    isTimerActive,
    incrementClicks
  } = useGame();
  
  const [characterScale, setCharacterScale] = useState(1);
  const [scaleTimeout, setScaleTimeout] = useState(null);

  const handleCharacterClick = () => {
    // Increment click counter for quests
    incrementClicks();
    
    // Start timer if not active
    if (!isTimerActive) {
      startTimer();
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

  const handleX4Click = () => {
    alert('x4 boost upgrade coming soon!');
  };

  const handleStarDonationClick = () => {
    // Show donation modal (will implement later)
    alert('Donation modal coming soon!');
  };

  return (
    <div className="home-content">
      <div className="income-counter">
        <span>{incomeRate}</span> Diamonds/h
        <img alt="Gem Stone" className="gem-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
      </div>
      <div className="income-timer">
        <span>{timerDisplay}</span>
        <span 
          onClick={handleX4Click}
          style={{marginLeft: 8, fontWeight: 'bold', color: 'gold', cursor: 'pointer'}}
        >
          x4
        </span>
      </div>
      <div className="coin-counter visible">
        <span>{Math.floor(coins)}</span>
        <img alt="Gem Stone" className="coin-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
        <div className="donation-line" onClick={handleStarDonationClick} style={{cursor: 'pointer'}}>
          <span>{stars}</span>
          <img alt="Star" src="https://em-content.zobj.net/source/telegram/386/star_2b50.webp" style={{width: 24, height: 24, verticalAlign: 'middle'}} />
        </div>
      </div>
      <div className="character-container">
        <img 
          alt={selectedCharacter.name} 
          className="character" 
          src={selectedCharacter.src}
          onClick={handleCharacterClick}
          style={{
            transform: `scale(${characterScale})`,
            transition: 'transform 0.3s ease'
          }}
        />
      </div>
    </div>
  );
} 