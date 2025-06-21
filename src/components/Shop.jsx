import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import shopService from '../api/services/shopService.ts';
import './Inventory.css';

export default function Shop() {
  const { gameStatus, fetchGameStatus } = useGame();
  const {
    cases,
    inventory,
    loading,
    error,
    fetchCases,
    fetchInventory,
    purchaseCase,
    upgradeCharacter,
    setActiveCharacter,
    clearError
  } = useShop();
  
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');
  const [upgrading, setUpgrading] = useState(false);
  const [settingActive, setSettingActive] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchCases();
    fetchInventory();
  }, [fetchCases, fetchInventory]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const getUserDiamonds = () => {
    return gameStatus?.diamonds_balance || 0;
  };

  const handleUpgradeCharacterDirect = async (character) => {
    if (upgrading) return;
    
    const upgradeCost = shopService.calculateUpgradeCost(character.level);
    const currentDiamonds = getUserDiamonds();
    
    if (currentDiamonds < upgradeCost) {
      alert(`Not enough diamonds! Required: ${upgradeCost}, you have: ${currentDiamonds}`);
      return;
    }

    setUpgrading(true);
    try {
      const result = await upgradeCharacter(character.id);
      if (result.success) {
        // Refresh game status to get updated diamond balance
        await fetchGameStatus();
        alert(`${character.character_name || character.name} upgraded to level ${result.new_level}!`);
      } else {
        alert(result.error || 'Error upgrading character');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      alert('Error upgrading character');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSetActiveCharacterDirect = async (character) => {
    if (settingActive) return;

    setSettingActive(true);
    try {
      const result = await setActiveCharacter(character.id);
      if (result.success) {
        alert(`${character.character_name || character.name} is now the active character!`);
      } else {
        alert(result.error || 'Error setting active character');
      }
    } catch (err) {
      console.error('Set active error:', err);
      alert('Error setting active character');
    } finally {
      setSettingActive(false);
    }
  };

  const getRarityClass = (incomeRate) => {
    const rarity = shopService.getCharacterRarity(incomeRate);
    return `rarity-${rarity}`;
  };

  const handleCaseClick = (caseData) => {
    if (isAnimationActive) return;
    
    const paymentMethod = shopService.getPaymentMethod(caseData);
    showCaseAnimation(caseData, paymentMethod);
  };

  const showCaseAnimation = async (caseData, paymentMethod) => {
    setIsAnimationActive(true);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "case-animation-overlay hidden";
    
    const message = document.createElement("div");
    message.className = "case-animation-message hidden";
    
    const priceText = shopService.formatPriceText(caseData);
    message.textContent = `Open ${caseData.name} for ${priceText}!`;
    
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
    spinButton.textContent = "Open Case";
    
    const cancelButton = document.createElement("button");
    cancelButton.className = "case-animation-cancel";
    cancelButton.textContent = "Cancel";
    
    overlay.appendChild(message);
    overlay.appendChild(animationContainer);
    overlay.appendChild(spinButton);
    overlay.appendChild(cancelButton);
    document.body.appendChild(overlay);

    try {
      // Get real case details and generate roulette with actual possible rewards
      const caseDetails = await shopService.getCaseDetails(caseData.id);
      const previewItems = generateRealRouletteItems(caseDetails);
      renderRouletteItems(rouletteStrip, previewItems);
      rouletteStrip.style.opacity = "1";
    } catch (error) {
      console.error('Error loading case details:', error);
      // Fallback to dummy items if case details fail
      const previewItems = generatePreviewRouletteItems();
      renderRouletteItems(rouletteStrip, previewItems);
      rouletteStrip.style.opacity = "1";
    }

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

    const startRoulette = async () => {
      try {
        spinButton.style.pointerEvents = "none";
        spinButton.style.opacity = "0.5";
        spinButton.textContent = "Opening...";
        
        // Purchase case using the service
        const result = await purchaseCase({
          case_id: caseData.id,
          payment_method: paymentMethod
        });
        
        if (!result.success) {
          alert(result.error || 'Failed to open case');
          onCancel();
          return;
        }
        
        const reward = result.reward;
        
        // Generate roulette items with the actual reward (using the same preview items but with real winner)
        const rouletteItems = shopService.generateRouletteItems(reward);
        
        // Re-render roulette with actual items and start animation
        rouletteStrip.innerHTML = "";
        renderRouletteItems(rouletteStrip, rouletteItems);
        
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
              if (reward.is_mutated && reward.name !== "Diamonds") {
                img.className += " mutated";
              }
            }
            
            const bgDiv = winnerItem.querySelector(".animation-background");
            if (bgDiv) {
              bgDiv.style.background = reward.background;
            }
            
            winnerItem.style.background = reward.background;
            winnerItem.classList.add("winner");
            
            let rewardText = reward.name;
            if (reward.type === 'diamonds') {
              rewardText = `${reward.value} Diamonds`;
            } else if (reward.is_mutated) {
              rewardText += " (Mutated)";
            }
            
            message.textContent = `You won ${rewardText}!`;
            
            // Refresh game status
            fetchGameStatus();
            
            setTimeout(() => {
              onCancel();
            }, 3000);
          }
          
          rouletteStrip.removeEventListener("animationend", onAnimationEnd);
        };

        rouletteStrip.addEventListener("animationend", onAnimationEnd);
        
      } catch (err) {
        console.error('Error opening case:', err);
        alert('Failed to open case. Please try again.');
        onCancel();
      }
    };

    cancelButton.addEventListener("click", onCancel);
    spinButton.addEventListener("click", startRoulette);
  };

  // Helper function to generate real roulette items from case details
  const generateRealRouletteItems = (caseDetails) => {
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

    const realItems = [];
    
    // Convert case rewards to roulette items
    caseDetails.rewards.forEach(reward => {
      if (reward.reward_type === 'diamonds') {
        const diamondAmount = reward.diamonds_min || 100;
        realItems.push({
          type: 'diamonds',
          name: 'Diamonds',
          src: reward.image_url || 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp',
          background: backgrounds[5], // Use a specific background for diamonds
          value: diamondAmount,
          is_mutated: false
        });
      } else if (reward.reward_type === 'character' && reward.character_name) {
        // Create character items with different mutation states
        const baseCharacter = {
          type: 'character',
          name: reward.character_name,
          src: reward.image_url,
          background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
          is_mutated: false
        };
        
        realItems.push(baseCharacter);
        
        // Add mutated version if mutation is possible
        if (reward.is_mutated_chance && reward.is_mutated_chance > 0) {
          realItems.push({
            ...baseCharacter,
            is_mutated: true
          });
        }
      }
    });

    // If no items found, fallback to basic items
    if (realItems.length === 0) {
      realItems.push({
        type: 'diamonds',
        name: 'Diamonds',
        src: 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp',
        background: backgrounds[5],
        value: 100,
        is_mutated: false
      });
    }

    // Generate 40 items for roulette, randomly selecting from real items
    const rouletteItems = [];
    for (let i = 0; i < 40; i++) {
      const randomItem = realItems[Math.floor(Math.random() * realItems.length)];
      rouletteItems.push({
        ...randomItem,
        // Randomize diamond values and backgrounds for variety
        value: randomItem.type === 'diamonds' ? 
          Math.floor(Math.random() * 200) + 50 : randomItem.value,
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)]
      });
    }

    return rouletteItems;
  };

  // Helper function to generate preview roulette items
  const generatePreviewRouletteItems = () => {
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

    const dummyItems = [
      { src: "https://em-content.zobj.net/source/telegram/386/monkey-face_1f435.webp", name: "Monkey" },
      { src: "https://em-content.zobj.net/source/telegram/386/gorilla_1f98d.webp", name: "Gorilla" },
      { src: "https://em-content.zobj.net/source/telegram/386/dog-face_1f436.webp", name: "Dog" },
      { src: "https://em-content.zobj.net/source/telegram/386/cat-face_1f431.webp", name: "Cat" },
      { src: "https://em-content.zobj.net/source/telegram/386/lion_1f981.webp", name: "Lion" },
      { src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp", name: "Diamonds" },
      { src: "https://em-content.zobj.net/source/telegram/386/robot_1f916.webp", name: "Robot" },
      { src: "https://em-content.zobj.net/source/telegram/386/alien_1f47d.webp", name: "Alien" },
      { src: "https://em-content.zobj.net/source/telegram/386/unicorn_1f984.webp", name: "Unicorn" },
      { src: "https://em-content.zobj.net/source/telegram/386/dragon_1f409.webp", name: "Dragon" }
    ];

    const previewItems = [];
    
    for (let i = 0; i < 40; i++) {
      const randomItem = dummyItems[Math.floor(Math.random() * dummyItems.length)];
      previewItems.push({
        type: randomItem.name === "Diamonds" ? "diamonds" : "character",
        name: randomItem.name,
        src: randomItem.src,
        is_mutated: randomItem.name !== "Diamonds" && Math.random() < 0.1,
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        value: randomItem.name === "Diamonds" ? Math.floor(Math.random() * 250) + 1 : undefined,
      });
    }

    return previewItems;
  };

  // Helper function to render roulette items
  const renderRouletteItems = (container, items) => {
    items.forEach((item, index) => {
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
      if (item.is_mutated && item.name !== "Diamonds") {
        img.className += " mutated";
      }
      itemDiv.appendChild(img);

      if (index === 19) {
        itemDiv.dataset.winner = "true";
      }
      container.appendChild(itemDiv);
    });
  };

  if (loading || !gameStatus) {
    return (
      <div className="shop-container visible">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>Loading shop...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-container visible">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => {
            clearError();
            fetchCases();
            fetchInventory();
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            {cases.map((caseData) => (
              <div 
                key={caseData.id}
                className={`case-container ${shopService.getRarityClass(caseData.rarity)}`} 
                onClick={() => handleCaseClick(caseData)}
              >
                <div className={`case-rarity ${shopService.getRarityClass(caseData.rarity)}-rarity`}>
                  {shopService.getRarityLabel(caseData.rarity)}
                </div>
                <img 
                  alt={caseData.name} 
                  className="case-image" 
                  src={caseData.image_url} 
                />
                <div className="case-name">{caseData.name}</div>
                <div className="case-description">{caseData.description}</div>
                <div className={`case-price ${caseData.is_free ? 'free' : ''}`}>
                  {caseData.is_free ? (
                    'Free'
                  ) : caseData.price_diamonds ? (
                    <>
                      <img src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" alt="Diamond" className="price-icon" />
                      {caseData.price_diamonds} Diamonds
                    </>
                  ) : caseData.price_ton ? (
                    <>
                      <span className="ton-icon">💎</span>
                      {caseData.price_ton} TON
                    </>
                  ) : (
                    'Free'
                  )}
                </div>
                {caseData.max_daily_opens && (
                  <div className="daily-limit">
                    Max {caseData.max_daily_opens}/day
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Content */}
              {activeTab === 'inventory' && (
          <div className="inventory-tab-content">
            <div className="inventory-main-content">
              <div className="characters-grid-tab">
                {inventory.filter(item => item.character_name || item.name).length === 0 ? (
                  <div className="empty-inventory-tab">
                    <p>You don't have any characters yet</p>
                    <p>Open cases in the shop to get characters!</p>
                  </div>
                ) : (
                  inventory.filter(item => item.character_name || item.name).map((character) => (
                    <div
                      key={character.id}
                      className={`case-container ${getRarityClass(character.income_rate)} ${character.is_active ? 'active-character' : ''}`}
                    >
                      <div className={`case-rarity ${getRarityClass(character.income_rate)}-rarity`}>
                        {shopService.getCharacterRarity(character.income_rate)}
                      </div>
                      
                      <img 
                        alt={character.character_name || character.name} 
                        className="case-image" 
                        src={character.src || character.image_url || `https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp`}
                      />
                      
                      <div className="case-name">{character.character_name || character.name}</div>
                      
                      <div className="case-description">
                        Level {character.level} • {character.income_rate} 💎/hour
                      </div>
                      
                      <div className="character-actions">
                        <button
                          className="character-upgrade-btn"
                          onClick={() => handleUpgradeCharacterDirect(character)}
                          disabled={upgrading || getUserDiamonds() < shopService.calculateUpgradeCost(character.level)}
                        >
                          <span className="btn-icon">⬆️</span>
                          Upgrade {shopService.calculateUpgradeCost(character.level)} 💎
                        </button>

                        {!character.is_active && (
                          <button
                            className="character-activate-btn"
                            onClick={() => handleSetActiveCharacterDirect(character)}
                            disabled={settingActive}
                          >
                            <span className="btn-icon">⭐</span>
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
} 