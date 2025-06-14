import React from 'react';
import { useGame } from '../context/GameContext';
import { TonConnectButton } from '@tonconnect/ui-react';

export default function Header() {
  const { player, totalCoins } = useGame();
  
  return (
    <header className="top-menu">
      <div className="top-menu-left">
        <img alt="Player Avatar" className="player-avatar" src={player.avatar} />
        <div className="player-info">
          <span className="player-nickname">{player.nickname}</span>
          <span className="player-max-coins">
            <img alt="Gem Stone" className="gem-icon" src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" />
            <span>{Math.floor(totalCoins)}</span>
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