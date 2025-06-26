import React from 'react';
import './App.css';
import Home from './components/Home';
import Shop from './components/Shop';
import Market from './components/Market';
import Quests from './components/Quests';
import Games from './components/Games';
import { GameProvider, useGame } from './context/GameContext';
import Header from './components/Header';
import Footer from './components/Footer';
import TelegramSync from './components/TelegramSync';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import useQuestProgress from './hooks/useQuestProgress';

function AppContent() {
  const { currentScreen, setCurrentScreen } = useGame();
  
  // Track quest progress automatically
  useQuestProgress();

  const handleScreenChange = (screen) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="App">
      <TelegramSync />
      <Header />
      
      {currentScreen === 'home' && <Home />}
      {currentScreen === 'shop' && <Shop />}
      {currentScreen === 'market' && <Market />}
      {currentScreen === 'quests' && <Quests />}
      {currentScreen === 'games' && <Games />}
      
      <Footer currentScreen={currentScreen} setCurrentScreen={handleScreenChange} />
    </div>
  );
}

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://taiakindaniil.github.io/nexari-mini-app/tonconnect-manifest.json">
      <GameProvider>
        <AppContent />
      </GameProvider>
    </TonConnectUIProvider>
  );
}

export default App;
