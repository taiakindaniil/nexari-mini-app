import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const CHARACTERS = [
  { src: "https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp", name: "Controller" },
  { src: "https://em-content.zobj.net/source/telegram/386/monkey-face_1f435.webp", name: "Monkey" },
  { src: "https://em-content.zobj.net/source/telegram/386/gorilla_1f98d.webp", name: "Gorilla" },
  { src: "https://em-content.zobj.net/source/telegram/386/dog-face_1f436.webp", name: "Dog" },
  { src: "https://em-content.zobj.net/source/telegram/386/cat-face_1f431.webp", name: "Cat" },
  { src: "https://em-content.zobj.net/source/telegram/386/lion_1f981.webp", name: "Lion" },
  { src: "https://em-content.zobj.net/source/telegram/386/tiger-face_1f42f.webp", name: "Tiger" },
  { src: "https://em-content.zobj.net/source/telegram/386/hamster_1f439.webp", name: "Hamster" },
  { src: "https://em-content.zobj.net/source/telegram/386/panda_1f43c.webp", name: "Panda" },
  { src: "https://em-content.zobj.net/source/telegram/386/chicken_1f414.webp", name: "Chicken" },
  { src: "https://em-content.zobj.net/source/telegram/386/baby-chick_1f424.webp", name: "Baby Chick" },
];

const BACKGROUND_GRADIENTS = [
  'linear-gradient(135deg, #ffafbd, #ffc3a0)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #84fab0, #8fd3f4)',
  '#ffcc70',
  'linear-gradient(135deg, #d299c2, #fef9d7)',
  '#000000',
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #ffecd2, #fcb69f)',
  '#d3f8e2',
  '#f6e7d7',
  '#b2fefa',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
  '#d1c4e9',
  '#f48fb1',
  '#ffe082',
  '#bcaaa4',
  '#ffab91',
  '#ce93d8',
  '#90caf9',
  '#a5d6a7',
  '#b0bec5',
  '#b39ddb',
  '#ef9a9a',
  '#a1887f'
];

const INITIAL_MARKET_SKINS = [
  { id: "skin1", character: CHARACTERS[1], background: BACKGROUND_GRADIENTS[0], price: 500, timestamp: Date.now() - 10000 },
  { id: "skin2", character: CHARACTERS[2], background: BACKGROUND_GRADIENTS[1], price: 750, timestamp: Date.now() - 9000 },
  { id: "skin3", character: CHARACTERS[3], background: BACKGROUND_GRADIENTS[2], price: 300, timestamp: Date.now() - 8000 },
  { id: "skin4", character: CHARACTERS[4], background: BACKGROUND_GRADIENTS[3], price: 1000, timestamp: Date.now() - 7000 },
  { id: "skin5", character: CHARACTERS[5], background: BACKGROUND_GRADIENTS[4], price: 600, timestamp: Date.now() - 6000 },
  { id: "skin6", character: CHARACTERS[6], background: BACKGROUND_GRADIENTS[5], price: 450, timestamp: Date.now() - 5000 },
  { id: "skin7", character: CHARACTERS[7], background: BACKGROUND_GRADIENTS[6], price: 800, timestamp: Date.now() - 4000 },
  { id: "skin8", character: CHARACTERS[8], background: BACKGROUND_GRADIENTS[7], price: 550, timestamp: Date.now() - 3000 },
  { id: "skin9", character: CHARACTERS[9], background: BACKGROUND_GRADIENTS[8], price: 700, timestamp: Date.now() - 2000 },
  { id: "skin10", character: CHARACTERS[10], background: BACKGROUND_GRADIENTS[9], price: 400, timestamp: Date.now() - 1000 },
];

const Market = () => {
  const { coins, spendCoins, addToInventory } = useGame();
  const [availableMarketSkins, setAvailableMarketSkins] = useState(INITIAL_MARKET_SKINS);
  const [characterFilter, setCharacterFilter] = useState('');
  const [backgroundFilter, setBackgroundFilter] = useState('');
  const [priceSort, setPriceSort] = useState('newest');

  const getFilteredAndSortedSkins = () => {
    let filteredSkins = [...availableMarketSkins];

    // Apply character filter
    if (characterFilter) {
      filteredSkins = filteredSkins.filter(skin => skin.character.name === characterFilter);
    }

    // Apply background filter
    if (backgroundFilter) {
      filteredSkins = filteredSkins.filter(skin => skin.background === backgroundFilter);
    }

    // Apply sorting
    if (priceSort === 'price-desc') {
      filteredSkins.sort((a, b) => b.price - a.price);
    } else if (priceSort === 'price-asc') {
      filteredSkins.sort((a, b) => a.price - b.price);
    } else {
      filteredSkins.sort((a, b) => b.timestamp - a.timestamp);
    }

    return filteredSkins;
  };

  const handleBuy = (skin) => {
    if (coins >= skin.price) {
      spendCoins(skin.price);
      addToInventory({
        id: Date.now(),
        src: skin.character.src,
        name: skin.character.name,
        background: skin.background,
        level: 1,
        incomeRate: 100
      });
      
      // Remove from market
      setAvailableMarketSkins(prev => prev.filter(s => s.id !== skin.id));
    } else {
      alert("Not enough diamonds!");
    }
  };

  const filteredSkins = getFilteredAndSortedSkins();

  return (
    <div className="market-container visible">      
      {/* Modern Filters */}
      <div className="market-filters">
        <div className="filter-group">
          <div className="filter-icon">🎭</div>
          <select 
            className="modern-filter-select" 
            value={characterFilter}
            onChange={(e) => setCharacterFilter(e.target.value)}
          >
            <option value="">All Characters</option>
            {CHARACTERS.map(char => (
              <option key={char.name} value={char.name}>{char.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-icon">🎨</div>
          <select 
            className="modern-filter-select"
            value={backgroundFilter}
            onChange={(e) => setBackgroundFilter(e.target.value)}
          >
            <option value="">All Backgrounds</option>
            {BACKGROUND_GRADIENTS.map((bg, index) => (
              <option key={bg} value={bg}>Style {index + 1}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-icon">📊</div>
          <select 
            className="modern-filter-select"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Market Items Grid */}
      <div className="market-grid">
        {filteredSkins.map(skin => (
          <div 
            key={skin.id} 
            className="market-item"
            style={{ background: skin.background }}
          >
            <img 
              src={skin.character.src} 
              alt={skin.character.name} 
              className="market-item-image"
            />
            <div className="market-item-name">{skin.character.name}</div>
            <button className="market-buy-button" onClick={() => handleBuy(skin)}>
              <span>Buy for {skin.price}</span>
              <img 
                src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
                alt="Gem Stone" 
                className="button-gem-icon"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market; 