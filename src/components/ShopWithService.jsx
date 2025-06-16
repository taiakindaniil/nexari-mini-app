import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import shopService from '../api/services/shopService.ts';
import './Inventory.css';

export default function ShopWithService() {
  const { gameStatus, fetchGameStatus } = useGame();
  const {
    cases,
    inventory,
    selectedCharacter,
    loading,
    error,
    fetchCases,
    fetchInventory,
    purchaseCase,
    upgradeCharacter,
    setActiveCharacter,
    selectCharacter,
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

  const handleSelectCharacter = (character) => {
    selectCharacter(character);
  };

  const getUserDiamonds = () => {
    return gameStatus?.diamonds_balance || 0;
  };

  const handleUpgradeCharacter = async () => {
    if (!selectedCharacter || upgrading) return;
    
    const upgradeCost = shopService.calculateUpgradeCost(selectedCharacter.level);
    const currentDiamonds = getUserDiamonds();
    
    if (currentDiamonds < upgradeCost) {
      alert(`Not enough diamonds! Required: ${upgradeCost}, you have: ${currentDiamonds}`);
      return;
    }

    setUpgrading(true);
    try {
      const result = await upgradeCharacter(selectedCharacter.id);
      if (result.success) {
        // Refresh game status to get updated diamond balance
        await fetchGameStatus();
        alert(`Character upgraded to level ${result.new_level}!`);
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

  const handleSetActiveCharacter = async () => {
    if (!selectedCharacter || settingActive) return;

    setSettingActive(true);
    try {
      const result = await setActiveCharacter(selectedCharacter.id);
      if (result.success) {
        alert(`${selectedCharacter.character_name || selectedCharacter.name} is now the active character!`);
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

  const getRarityColor = (incomeRate) => {
    return shopService.getCharacterRarityColor(incomeRate);
  };

  const getCharacterIcon = (character) => {
    const name = character.character_name || character.name;
    switch (name) {
      case 'Crypto Miner': return '⛏️';
      case 'Diamond Hunter': return '💎';
      case 'Quantum Processor':
      case 'Quantum Computer': return '🔬';
      case 'Legendary Dragon': return '🐉';
      case 'Space Explorer': return '🚀';
      case 'Magic Wizard': return '🧙‍♂️';
      case 'Controller': return '🎮';
      case 'Smartphone': return '📱';
      default: return '❓';
    }
  };

  const handleCaseClick = (caseData) => {
    if (isAnimationActive) return;
    
    const paymentMethod = shopService.getPaymentMethod(caseData);
    showCaseAnimation(caseData, paymentMethod);
  };

  const showCaseAnimation = (caseData, paymentMethod) => {
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
        
        // Generate roulette items with the actual reward
        const rouletteItems = shopService.generateRouletteItems(reward);
        
        // Render roulette
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
          if (item.is_mutated && item.name !== "Diamonds") {
            img.className += " mutated";
          }
          itemDiv.appendChild(img);

          if (index === 19) {
            itemDiv.dataset.winner = "true";
          }
          rouletteStrip.appendChild(itemDiv);
        });
        
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
          <div className="inventory-header-tab">
            <h3>Character Inventory</h3>
            <div className="inventory-stats-tab">
              <span>Total characters: {inventory.filter(item => item.character_name || item.name).length}</span>
              <span>💎 {getUserDiamonds()}</span>
            </div>
          </div>

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
                    className={`character-card-tab ${selectedCharacter?.id === character.id ? 'selected' : ''} ${getRarityClass(character.income_rate)}`}
                    onClick={() => handleSelectCharacter(character)}
                    style={{ '--rarity-color': getRarityColor(character.income_rate) }}
                  >
                    <div className="character-card-header-tab">
                      <div className="character-level-tab">Lvl. {character.level}</div>
                      {character.is_active && <div className="active-badge-tab">Active</div>}
                    </div>
                    
                    <div className="character-avatar-tab">
                      <div className="character-icon-tab">
                        {getCharacterIcon(character)}
                      </div>
                    </div>

                    <div className="character-info-tab">
                      <h4 className="character-name-tab">{character.character_name || character.name}</h4>
                      <div className="character-stats-tab">
                        <div className="stat-tab">
                          <span className="stat-label-tab">Income/hour:</span>
                          <span className="stat-value-tab">{character.income_rate}</span>
                        </div>
                        <div className="stat-tab">
                          <span className="stat-label-tab">Rarity:</span>
                          <span className={`stat-value-tab ${getRarityClass(character.income_rate)}`}>
                            {shopService.getCharacterRarity(character.income_rate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="character-card-footer-tab">
                      <div className="upgrade-cost-tab">
                        Upgrade: {shopService.calculateUpgradeCost(character.level)} 💎
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedCharacter && (
              <div className="character-details-tab">
                <div className="details-header-tab">
                  <h4>Selected Character</h4>
                  <button 
                    className="close-details-tab"
                    onClick={() => selectCharacter(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="details-content-tab">
                  <div className="character-preview-tab">
                    <div className="character-avatar-large-tab">
                      <div className="character-icon-large-tab">
                        {getCharacterIcon(selectedCharacter)}
                      </div>
                    </div>
                    
                    <div className="character-details-info-tab">
                      <h5>{selectedCharacter.character_name || selectedCharacter.name}</h5>
                      <div className="detail-stats-tab">
                        <div className="detail-stat-tab">
                          <span>Level:</span>
                          <span>{selectedCharacter.level}</span>
                        </div>
                        <div className="detail-stat-tab">
                          <span>Hourly income:</span>
                          <span>{selectedCharacter.income_rate} 💎</span>
                        </div>
                        <div className="detail-stat-tab">
                          <span>Rarity:</span>
                          <span className={getRarityClass(selectedCharacter.income_rate)}>
                            {shopService.getCharacterRarity(selectedCharacter.income_rate)}
                          </span>
                        </div>
                        <div className="detail-stat-tab">
                          <span>Status:</span>
                          <span>{selectedCharacter.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="character-actions-tab">
                    <button
                      className="upgrade-button-tab"
                      onClick={handleUpgradeCharacter}
                      disabled={upgrading || getUserDiamonds() < shopService.calculateUpgradeCost(selectedCharacter.level)}
                    >
                      {upgrading ? 'Upgrading...' : `Upgrade for ${shopService.calculateUpgradeCost(selectedCharacter.level)} 💎`}
                    </button>

                    {!selectedCharacter.is_active && (
                      <button
                        className="activate-button-tab"
                        onClick={handleSetActiveCharacter}
                        disabled={settingActive}
                      >
                        {settingActive ? 'Activating...' : 'Set as Active'}
                      </button>
                    )}
                  </div>

                  <div className="upgrade-preview-tab">
                    <h6>After upgrade:</h6>
                    <div className="upgrade-stats-tab">
                      <div className="upgrade-stat-tab">
                        <span>Level:</span>
                        <span>{selectedCharacter.level} → {selectedCharacter.level + 1}</span>
                      </div>
                      <div className="upgrade-stat-tab">
                        <span>Hourly income:</span>
                        <span>{selectedCharacter.income_rate} → {Math.floor(selectedCharacter.income_rate * 1.5)} 💎</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 