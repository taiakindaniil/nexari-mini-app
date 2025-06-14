import React from 'react';

export default function Footer({ currentScreen, setCurrentScreen }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: 'https://em-content.zobj.net/source/telegram/386/television_1f4fa.webp' },
    { id: 'shop', label: 'Shop', icon: 'https://em-content.zobj.net/source/telegram/386/money-with-wings_1f4b8.webp' },
    { id: 'market', label: 'Market', icon: 'https://em-content.zobj.net/source/telegram/386/star_2b50.webp' },
    { id: 'quests', label: 'Quests', icon: 'https://em-content.zobj.net/source/telegram/386/trophy_1f3c6.webp' },
    { id: 'games', label: 'Games', icon: 'https://em-content.zobj.net/source/telegram/386/revolving-hearts_1f49e.webp' }
  ];

  return (
    <footer>
      <div className="footer-menu-container">
        <div className="footer-menu">
          {menuItems.map(item => (
            <div 
              key={item.id}
              className={`menu-item ${currentScreen === item.id ? 'highlighted' : ''}`}
              onClick={() => setCurrentScreen(item.id)}
            >
              <img alt={item.label} src={item.icon} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
} 