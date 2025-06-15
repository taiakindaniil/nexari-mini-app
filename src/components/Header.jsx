import React from 'react';
import { useGame } from '../context/GameContext';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '../hooks/useTonConnect';

export default function Header() {
  const { player, gameStatus } = useGame();
  
  // Инициализируем хук для работы с кошельком (логика работает в фоне)
  useTonConnect();

  return (
    <header className="top-menu">
      <div className="top-menu-left">
        <img 
          alt="Player Avatar" 
          className="player-avatar" 
          src={player.avatar} 
          onError={(e) => {
            console.log('Avatar loading error, using fallback');
            e.target.src = 'https://placehold.co/40x40';
          }}
        />
        <div className="player-info">
          <span className="player-nickname">{player.nickname}</span>
          <span className="player-max-coins">
            <img alt="Gem Stone" className="gem-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
            <span>{Math.floor(gameStatus?.diamonds_balance || 0)}</span>
          </span>
        </div>
      </div>
      <div className="top-menu-right">
        <div className="wallet-container">
          <TonConnectButton />
        </div>
      </div>
    </header>
  );
} 