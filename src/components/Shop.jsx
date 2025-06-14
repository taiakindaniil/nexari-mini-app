import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Shop() {
  const { 
    coins, 
    spendCoins, 
    addToInventory, 
    addCoins, 
    inventory, 
    upgradeCharacter, 
    setSelectedCharacter 
  } = useGame();
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' or 'inventory'

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleUpgrade = (item) => {
    const upgradeCosts = { 1: 500, 2: 1000, 3: 2000, 4: 4000 };
    const cost = upgradeCosts[item.level];
    
    if (item.level >= 5) {
      alert('Character is already at max level!');
      return;
    }
    
    if (coins < cost) {
      alert('Not enough diamonds!');
      return;
    }
    
    if (upgradeCharacter(item.id)) {
      // Show upgrade animation
      const itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
      if (itemElement) {
        itemElement.classList.add('upgrade-anim');
        setTimeout(() => itemElement.classList.remove('upgrade-anim'), 500);
      }
      
      // Show upgrade message
      showUpgradeMessage();
    }
  };

  const handleSelectCharacter = (item) => {
    setSelectedCharacter(item);
  };

  const showUpgradeMessage = () => {
    const msg = document.createElement('div');
    msg.textContent = 'Upgrade purchased!';
    msg.style.position = 'fixed';
    msg.style.top = '20%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.backgroundColor = '#000';
    msg.style.color = '#fff';
    msg.style.padding = '1rem';
    msg.style.borderRadius = '12px';
    msg.style.zIndex = '9999';
    document.body.appendChild(msg);
    
    setTimeout(() => {
      msg.remove();
    }, 2000);
  };

  const getUpgradeCost = (level) => {
    const costs = { 1: 500, 2: 1000, 3: 2000, 4: 4000 };
    return costs[level] || 0;
  };

  const handleCaseClick = (caseType) => {
    if (isAnimationActive) return;
    
    showCaseAnimation(caseType);
  };

  const showCaseAnimation = (caseType) => {
    const isDiamondCase = caseType === 'diamond-rain';
    const isTelegramGift = caseType === 'telegram-gift' || caseType === 'telegram-gift-2';
    const currency = isDiamondCase ? "100 Diamonds" : isTelegramGift ? "Free" : "Free (Test)";
    
    setIsAnimationActive(true);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "case-animation-overlay hidden";
    
    const message = document.createElement("div");
    message.className = "case-animation-message hidden";
    message.textContent = `Spin for ${currency}!`;
    
    const animationContainer = document.createElement("div");
    animationContainer.className = "case-animation-container";
    
    const rouletteStrip = document.createElement("div");
    rouletteStrip.className = "roulette-strip";
    animationContainer.appendChild(rouletteStrip);
    
    const animationBar = document.createElement("div");
    animationBar.className = "animation-bar";
    animationContainer.appendChild(animationBar);
    
    const spinButton = document.createElement("button");
    spinButton.className = "case-animation-button";
    spinButton.textContent = "Spin";
    
    const cancelButton = document.createElement("button");
    cancelButton.className = "case-animation-cancel";
    cancelButton.textContent = "I'll stop tempting fate";
    
    overlay.appendChild(message);
    overlay.appendChild(animationContainer);
    overlay.appendChild(spinButton);
    overlay.appendChild(cancelButton);
    document.body.appendChild(overlay);

    // Generate reward and roulette items
    const reward = generateReward(caseType);
    const rouletteItems = generateRouletteItems(caseType, reward);

    const renderRoulette = () => {
      rouletteStrip.innerHTML = "";
      rouletteItems.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "roulette-item";
        itemDiv.style.background = item.background;
        
        const bgDiv = document.createElement("div");
        bgDiv.className = "animation-background";
        bgDiv.style.background = item.background;
        itemDiv.appendChild(bgDiv);

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.name;
        img.className = "animation-character";
        if (item.isMutated && item.name !== "Diamonds") {
          img.className += " mutated";
        }
        itemDiv.appendChild(img);

        if (index === 19) {
          itemDiv.dataset.winner = "true";
        }
        rouletteStrip.appendChild(itemDiv);
      });
    };

    renderRoulette();

    // Show animation
    requestAnimationFrame(() => {
      overlay.classList.remove("hidden");
      overlay.classList.add("visible");
      message.classList.remove("hidden");
      message.classList.add("visible");
      setTimeout(() => {
        spinButton.classList.add("visible");
        cancelButton.classList.add("visible");
      }, 300);
    });

    const onCancel = () => {
      overlay.classList.remove("visible");
      overlay.classList.add("hidden");
      message.classList.remove("visible");
      message.classList.add("hidden");
      spinButton.classList.remove("visible");
      cancelButton.classList.remove("visible");
      setTimeout(() => {
        overlay.remove();
        setIsAnimationActive(false);
      }, 500);
    };

    const startRoulette = () => {
      let cost = 0;
      if (caseType === 'diamond-rain') cost = 100;
      else if (caseType === 'mystery-box') cost = 500;
      else if (caseType === 'cosmic-chest') cost = 250;
      
      if (cost > 0 && coins < cost) {
        alert("Not enough diamonds!");
        onCancel();
        return;
      }
      
      if (cost > 0) {
        spendCoins(cost);
      }

      spinButton.style.pointerEvents = "none";
      spinButton.style.opacity = "0.5";
      rouletteStrip.style.opacity = "1";
      rouletteStrip.style.animation = "roulette-spin 5s cubic-bezier(0.1, 0.7, 0.3, 1) forwards";

      const onAnimationEnd = () => {
        const isMobile = window.innerWidth <= 600;
        rouletteStrip.style.transform = isMobile ? "translateX(-2008px)" : "translateX(-2434px)";
        
        const winnerIndex = 19;
        const winnerItem = rouletteStrip.children[winnerIndex];
        
        if (winnerItem) {
          const img = winnerItem.querySelector("img");
          if (img) {
            img.src = reward.src;
            img.alt = reward.name;
            img.className = "animation-character";
            if (reward.isMutated && reward.name !== "Diamonds") {
              img.className += " mutated";
            }
          }
          
          const bgDiv = winnerItem.querySelector(".animation-background");
          if (bgDiv) {
            bgDiv.style.background = reward.background;
          }
          
          winnerItem.style.background = reward.background;
          winnerItem.classList.add("winner");
          
          message.textContent = `You won ${reward.name === "Diamonds" ? `${reward.value} Diamonds` : reward.name}${reward.isMutated && reward.name !== "Diamonds" ? " (Mutated)" : ""}!`;
          
          if (reward.type === 'diamonds') {
            addCoins(reward.value);
          } else {
            addToInventory(reward);
          }
          
          setTimeout(() => {
            onCancel();
          }, 3000);
        }
        
        rouletteStrip.removeEventListener("animationend", onAnimationEnd);
      };

      rouletteStrip.addEventListener("animationend", onAnimationEnd);
    };

    cancelButton.addEventListener("click", onCancel);
    spinButton.addEventListener("click", startRoulette);
  };

  const generateRouletteItems = (caseType, reward) => {
    const characters = [
      { src: "https://em-content.zobj.net/source/telegram/386/monkey-face_1f435.webp", name: "Monkey" },
      { src: "https://em-content.zobj.net/source/telegram/386/gorilla_1f98d.webp", name: "Gorilla" },
      { src: "https://em-content.zobj.net/source/telegram/386/dog-face_1f436.webp", name: "Dog" },
      { src: "https://em-content.zobj.net/source/telegram/386/cat-face_1f431.webp", name: "Cat" },
      { src: "https://em-content.zobj.net/source/telegram/386/lion_1f981.webp", name: "Lion" }
    ];

    const backgrounds = [
      'linear-gradient(135deg, #ffafbd, #ffc3a0)',
      'linear-gradient(135deg, #89f7fe, #66a6ff)',
      'linear-gradient(135deg, #f6d365, #fda085)',
      'linear-gradient(135deg, #84fab0, #8fd3f4)',
      '#ffcc70',
      'linear-gradient(135deg, #d299c2, #fef9d7)',
      '#000000',
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      '#d3f8e2'
    ];

    const telegramGiftItems = [
      { name: "Car", src: "https://em-content.zobj.net/source/telegram/386/automobile_1f697.webp" },
      { name: "Boat", src: "https://em-content.zobj.net/source/telegram/386/motor-boat_1f6e5-fe0f.webp" },
      { name: "Plane", src: "https://em-content.zobj.net/source/telegram/386/airplane_2708-fe0f.webp" },
      { name: "Rocket", src: "https://em-content.zobj.net/source/telegram/386/rocket_1f680.webp" },
      { name: "Phone", src: "https://em-content.zobj.net/source/telegram/386/mobile-phone_1f4f1.webp" }
    ];

    const diamondItem = { 
      src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp", 
      name: "Diamonds" 
    };

    const isDiamondCase = caseType === 'diamond-rain';
    const isTelegramGift = caseType === 'telegram-gift' || caseType === 'telegram-gift-2';
    
    const items = isTelegramGift ? telegramGiftItems : characters;
    if (isDiamondCase) {
      items.push(diamondItem);
    }

    const rouletteItems = [];
    
    for (let i = 0; i < 40; i++) {
      if (i === 19) {
        rouletteItems.push(reward);
        continue;
      }

      let randomItem;
      if (isDiamondCase && Math.random() < 0.6) {
        randomItem = {
          ...diamondItem,
          value: Math.floor(Math.random() * 250) + 1
        };
      } else if (isTelegramGift) {
        randomItem = telegramGiftItems[Math.floor(Math.random() * telegramGiftItems.length)];
      } else {
        randomItem = characters[Math.floor(Math.random() * characters.length)];
      }

      rouletteItems.push({
        ...randomItem,
        isMutated: randomItem.name !== "Diamonds" && Math.random() < 0.1,
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        value: randomItem.name === "Diamonds" ? Math.floor(Math.random() * 250) + 1 : undefined,
      });
    }

    return rouletteItems;
  };

  const generateReward = (caseType) => {
    const characters = [
      { src: "https://em-content.zobj.net/source/telegram/386/monkey-face_1f435.webp", name: "Monkey" },
      { src: "https://em-content.zobj.net/source/telegram/386/gorilla_1f98d.webp", name: "Gorilla" },
      { src: "https://em-content.zobj.net/source/telegram/386/dog-face_1f436.webp", name: "Dog" },
      { src: "https://em-content.zobj.net/source/telegram/386/cat-face_1f431.webp", name: "Cat" },
      { src: "https://em-content.zobj.net/source/telegram/386/lion_1f981.webp", name: "Lion" }
    ];

    const backgrounds = [
      'linear-gradient(135deg, #ffafbd, #ffc3a0)',
      'linear-gradient(135deg, #89f7fe, #66a6ff)',
      'linear-gradient(135deg, #f6d365, #fda085)',
      'linear-gradient(135deg, #84fab0, #8fd3f4)',
      '#ffcc70',
      'linear-gradient(135deg, #d299c2, #fef9d7)',
      '#000000',
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      '#d3f8e2'
    ];

    const telegramGiftItems = [
      { name: "Car", src: "https://em-content.zobj.net/source/telegram/386/automobile_1f697.webp" },
      { name: "Boat", src: "https://em-content.zobj.net/source/telegram/386/motor-boat_1f6e5-fe0f.webp" },
      { name: "Plane", src: "https://em-content.zobj.net/source/telegram/386/airplane_2708-fe0f.webp" },
      { name: "Rocket", src: "https://em-content.zobj.net/source/telegram/386/rocket_1f680.webp" },
      { name: "Phone", src: "https://em-content.zobj.net/source/telegram/386/mobile-phone_1f4f1.webp" }
    ];

    const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    if (caseType === 'diamond-rain') {
      const roll = Math.random();
      if (roll < 0.95) {
        const diamonds = Math.floor(Math.random() * 180) + 1;
        return {
          type: "diamonds",
          name: "Diamonds",
          value: diamonds,
          isMutated: false,
          background,
          src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp",
        };
      } else {
        const character = characters[Math.floor(Math.random() * characters.length)];
        const isMutated = Math.random() < 0.1;
        return {
          type: "character",
          src: character.src,
          name: character.name,
          isMutated,
          background,
          level: 1,
          incomeRate: 100
        };
      }
    } else if (caseType === 'mystery-box') {
      const roll = Math.random();
      if (roll < 0.7) {
        const diamonds = Math.floor(Math.random() * 500) + 100;
        return {
          type: "diamonds",
          name: "Diamonds",
          value: diamonds,
          isMutated: false,
          background,
          src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp",
        };
      } else {
        const character = characters[Math.floor(Math.random() * characters.length)];
        const isMutated = Math.random() < 0.3;
        return {
          type: "character",
          src: character.src,
          name: character.name,
          isMutated,
          background,
          level: Math.floor(Math.random() * 3) + 1,
          incomeRate: 200
        };
      }
    } else if (caseType === 'cosmic-chest') {
      const cosmicItems = [
        { name: "Alien", src: "https://em-content.zobj.net/source/telegram/386/alien_1f47d.webp" },
        { name: "UFO", src: "https://em-content.zobj.net/source/telegram/386/flying-saucer_1f6f8.webp" },
        { name: "Satellite", src: "https://em-content.zobj.net/source/telegram/386/satellite_1f4e1.webp" },
        { name: "Astronaut", src: "https://em-content.zobj.net/source/telegram/386/astronaut_1f9d1.webp" },
        { name: "Planet", src: "https://em-content.zobj.net/source/telegram/386/ringed-planet_1fa90.webp" }
      ];
      const selectedItem = cosmicItems[Math.floor(Math.random() * cosmicItems.length)];
      const isMutated = Math.random() < 0.2;
      return {
        type: "character",
        name: selectedItem.name,
        src: selectedItem.src,
        isMutated,
        background,
        level: 1,
        incomeRate: 150
      };
    } else if (caseType === 'telegram-gift' || caseType === 'telegram-gift-2') {
      const selectedItem = telegramGiftItems[Math.floor(Math.random() * telegramGiftItems.length)];
      const isMutated = Math.random() < 0.1;
      return {
        type: "character",
        name: selectedItem.name,
        src: selectedItem.src,
        isMutated,
        background,
        level: 1,
        incomeRate: 100
      };
    } else {
      const character = characters[Math.floor(Math.random() * characters.length)];
      const isMutated = Math.random() < 0.1;
      return {
        type: "character",
        src: character.src,
        name: character.name,
        isMutated,
        background,
        level: 1,
        incomeRate: 100
      };
    }
  };

  return (
    <div className="shop-container visible">
      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button 
          className={`tab-button ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('cases')}
        >
          <span className="tab-icon">📦</span>
          Cases
        </button>
        <button 
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('inventory')}
        >
          <span className="tab-icon">🎒</span>
          Inventory
        </button>
      </div>

      {/* Cases Content */}
      {activeTab === 'cases' && (
        <div className="cases-content">
          <div className="cases-grid">
            <div className="case-container premium" onClick={() => handleCaseClick('diamond-rain')}>
              <div className="case-rarity premium-rarity">Premium</div>
              <img alt="Diamond Rain" className="case-image" src="https://em-content.zobj.net/source/telegram/386/popcorn_1f37f.webp" />
              <div className="case-name">Diamond Rain</div>
              <div className="case-description">High chance for diamonds</div>
              <div className="case-price">
                <img src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" alt="Diamond" className="price-icon" />
                100 Diamonds
              </div>
            </div>
            
            <div className="case-container common" onClick={() => handleCaseClick('character-magic')}>
              <div className="case-rarity common-rarity">Common</div>
              <img alt="Character Magic" className="case-image" src="https://em-content.zobj.net/source/telegram/386/luggage_1f9f3.webp" />
              <div className="case-name">Character Magic</div>
              <div className="case-description">Random characters</div>
              <div className="case-price free">Free (Test)</div>
            </div>
            
            <div className="case-container exclusive" onClick={() => handleCaseClick('telegram-gift')}>
              <div className="case-rarity exclusive-rarity">Exclusive</div>
              <img alt="Telegram Gift" className="case-image" src="https://em-content.zobj.net/source/telegram/386/crystal-ball_1f52e.webp" />
              <div className="case-name">Exclusive</div>
              <div className="case-description">Special rewards</div>
              <div className="case-price free">Free</div>
            </div>
            
            <div className="case-container rare" onClick={() => handleCaseClick('telegram-gift-2')}>
              <div className="case-rarity rare-rarity">Rare</div>
              <img alt="Telegram Gift 2" className="case-image" src="https://em-content.zobj.net/source/telegram/386/wrapped-gift_1f381.webp" />
              <div className="case-name">Telegram Gift</div>
              <div className="case-description">Vehicle collection</div>
              <div className="case-price free">Free</div>
            </div>
            
            <div className="case-container legendary" onClick={() => handleCaseClick('mystery-box')}>
              <div className="case-rarity legendary-rarity">Legendary</div>
              <img alt="Mystery Box" className="case-image" src="https://em-content.zobj.net/source/telegram/386/package_1f4e6.webp" />
              <div className="case-name">Mystery Box</div>
              <div className="case-description">Ultra rare items</div>
              <div className="case-price">
                <img src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" alt="Diamond" className="price-icon" />
                500 Diamonds
              </div>
            </div>
            
            <div className="case-container epic" onClick={() => handleCaseClick('cosmic-chest')}>
              <div className="case-rarity epic-rarity">Epic</div>
              <img alt="Cosmic Chest" className="case-image" src="https://em-content.zobj.net/source/telegram/386/milky-way_1f30c.webp" />
              <div className="case-name">Cosmic Chest</div>
              <div className="case-description">Space-themed rewards</div>
              <div className="case-price">
                <img src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" alt="Diamond" className="price-icon" />
                250 Diamonds
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Content */}
      {activeTab === 'inventory' && (
        <div className="inventory-content">
          <div className="inventory-items-container">
            {inventory.length === 0 ? (
              <div className="empty-inventory">
                <div className="empty-icon">📦</div>
                <div className="empty-text">No items in inventory</div>
                <div className="empty-subtext">Open some cases to get started!</div>
              </div>
            ) : (
              inventory.map((item) => (
                <div 
                  key={item.id}
                  data-item-id={item.id}
                  className="inventory-item-container"
                  style={{ 
                    background: item.background || 'none',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                  }}
                  onClick={(e) => {
                    // Only select character if not clicking upgrade button
                    if (!e.target.closest('.upgrade-button')) {
                      handleSelectCharacter(item);
                    }
                  }}
                >
                  <img 
                    src={item.src} 
                    alt={item.name} 
                    className={`inventory-image ${item.isMutated ? 'mutated' : ''}`}
                  />
                  <div className="inventory-details">
                    <div className="inventory-name">{item.name}</div>
                    <div className="inventory-stats">
                      Lvl {item.level}, {item.incomeRate}/h
                      {item.isMutated && <span className="mutated-label">⚡ Mutated</span>}
                    </div>
                  </div>
                  <div 
                    className="upgrade-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(item);
                    }}
                  >
                    {item.level < 5 ? (
                      <>
                        Up {getUpgradeCost(item.level)} 
                        <img src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" alt="Diamond" className="gem-icon" />
                      </>
                    ) : (
                      <span className="max-level">MAX</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 