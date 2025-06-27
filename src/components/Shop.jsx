import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import { useMarket } from '../api/hooks/useMarket.ts';
import { useTonConnect } from '../hooks/useTonConnect.ts';
import shopService from '../api/services/shopService.ts';
import './Inventory.css';

// Separate Modal Component
const SellModal = React.memo(({ 
  isOpen, 
  character, 
  price, 
  onPriceChange, 
  onConfirm, 
  onCancel, 
  selling,
  isWalletConnected 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getRarityClass = (rarity) => {
    return `rarity-${rarity}`;
  };

  return createPortal(
    <div className="sell-modal-overlay visible" onClick={handleOverlayClick}>
      <div className="sell-modal">
        <h3>Sell Character for TON</h3>
        {character && (
          <div className="sell-character-info">
            <img 
              src={character.src || character.image_url || `https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp`}
              alt={character.character_name || character.name}
              className="sell-character-image"
            />
            <div className="sell-character-details">
              <h4>{character.character_name || character.name}</h4>
              <p>Level {character.level}</p>
              <p>{character.current_income_rate} 💎/hour</p>
              <p className={`rarity ${getRarityClass(character.rarity)}`}>
                {shopService.getRarityLabel(character.rarity)}
              </p>
            </div>
          </div>
        )}
        
        {!isWalletConnected ? (
          <div className="wallet-warning">
            <p>⚠️ You need to connect your TON wallet to sell characters</p>
            <p>Please connect your wallet first</p>
          </div>
        ) : (
          <div className="sell-price-input">
            <label htmlFor="sellPrice">Price (TON):</label>
            <input
              id="sellPrice"
              type="number"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="Enter price in TON (minimum 0.001)"
              min="0.001"
              step="0.001"
            />
            <small>Minimum price: 0.001 TON</small>
          </div>
        )}
        
        <div className="sell-modal-actions">
          <button 
            className="sell-confirm-btn"
            onClick={onConfirm}
            disabled={selling || !price || !isWalletConnected}
          >
            {selling ? 'Listing...' : 'List for Sale'}
          </button>
          <button 
            className="sell-cancel-btn"
            onClick={onCancel}
            disabled={selling}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default function Shop() {
  const { gameStatus, fetchGameStatus, setActiveCharacter: gameSetActiveCharacter } = useGame();
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
  
  const { createListing, tonToNanoTon } = useMarket();
  const { wallet } = useTonConnect();
  
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');
  const [upgrading, setUpgrading] = useState(false);
  const [settingActive, setSettingActive] = useState(false);
  const [loadingCaseId, setLoadingCaseId] = useState(null);
  
  // Sell modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedCharacterForSale, setSelectedCharacterForSale] = useState(null);
  const [sellPrice, setSellPrice] = useState('');
  const [selling, setSelling] = useState(false);

  // Check if wallet is connected
  const isWalletConnected = !!wallet?.account?.address;

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
    
    const upgradeCost = character.upgrade_cost;
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
        // Also update the game context with the new active character
        if (gameSetActiveCharacter) {
          // This will update the main screen immediately
          await gameSetActiveCharacter(character.id);
        }
        
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

  const getRarityClass = (rarity) => {
    return `rarity-${rarity}`;
  };

  const handleSellClick = useCallback((character) => {
    if (character.is_active) {
      alert('Cannot sell active character! Set another character as active first.');
      return;
    }
    
    if (!isWalletConnected) {
      alert('Please connect your TON wallet to sell characters.');
      return;
    }
    
    setSelectedCharacterForSale(character);
    setShowSellModal(true);
  }, [isWalletConnected]);

  const handleSellSubmit = useCallback(async () => {
    if (!selectedCharacterForSale || !sellPrice) {
      alert('Please enter a price');
      return;
    }

    if (!isWalletConnected) {
      alert('Please connect your TON wallet first');
      return;
    }

    const priceInTon = parseFloat(sellPrice);
    if (isNaN(priceInTon) || priceInTon < 0.001) {
      alert('Please enter a valid price (minimum 0.001 TON)');
      return;
    }

    // Convert TON to nanoTON
    const priceInNanoTon = tonToNanoTon(priceInTon);

    setSelling(true);
    try {
      const result = await createListing({
        user_character_id: selectedCharacterForSale.id,
        price_nanoton: priceInNanoTon
      });

      if (result.success) {
        await fetchInventory(); // Refresh inventory
        setShowSellModal(false);
        setSelectedCharacterForSale(null);
        setSellPrice('');
        alert(`Successfully listed ${selectedCharacterForSale.character_name || selectedCharacterForSale.name} (Level ${selectedCharacterForSale.level}) for ${priceInTon} TON!`);
      } else {
        alert(result.error || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      alert('Failed to create listing. Please try again.');
    } finally {
      setSelling(false);
    }
  }, [selectedCharacterForSale, sellPrice, createListing, fetchInventory, isWalletConnected, tonToNanoTon]);

  const handleSellCancel = useCallback(() => {
    setShowSellModal(false);
    setSelectedCharacterForSale(null);
    setSellPrice('');
  }, []);

  const handlePriceChange = useCallback((value) => {
    setSellPrice(value);
  }, []);

  const handleCaseClick = (caseData) => {
    if (isAnimationActive || loadingCaseId === caseData.id) return;
    
    setLoadingCaseId(caseData.id);
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

    let realRouletteItems = [];
    
    try {
      // Get real case details and generate roulette with actual possible rewards
      const caseDetails = await shopService.getCaseDetails(caseData.id);
      realRouletteItems = generateRealRouletteItems(caseDetails);
      renderRouletteItems(rouletteStrip, realRouletteItems);
      rouletteStrip.style.opacity = "1";
    } catch (error) {
      console.error('Error loading case details:', error);
      // Fallback to dummy items if case details fail
      realRouletteItems = generatePreviewRouletteItems();
      renderRouletteItems(rouletteStrip, realRouletteItems);
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
        setLoadingCaseId(null);
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
        
        // Create a copy of real items and set the winner at position 19
        const finalRouletteItems = [...realRouletteItems];
        finalRouletteItems[19] = {
          type: reward.type,
          name: reward.name,
          src: reward.src,
          background: reward.background,
          value: reward.value,
          is_mutated: reward.is_mutated || false
        };
        
        // Re-render roulette with the real winner in position 19
        rouletteStrip.innerHTML = "";
        renderRouletteItems(rouletteStrip, finalRouletteItems);
        
        rouletteStrip.style.animation = "roulette-spin 5s cubic-bezier(0.1, 0.7, 0.3, 1) forwards";

        const onAnimationEnd = () => {
          const isMobile = window.innerWidth <= 600;
          rouletteStrip.style.transform = isMobile ? "translateX(-2008px)" : "translateX(-2434px)";
          
          const winnerIndex = 19;
          const winnerItem = rouletteStrip.children[winnerIndex];
          
          if (winnerItem) {
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
    const items = [];
    const totalItems = 40;
    
    for (let i = 0; i < totalItems; i++) {
      const randomReward = caseDetails.rewards[Math.floor(Math.random() * caseDetails.rewards.length)];
      
      let item;
      if (randomReward.reward_type === 'diamonds') {
        item = {
          type: 'diamonds',
          name: 'Diamonds',
          src: 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp',
          background: '#87CEEB',
          value: randomReward.reward_diamonds
        };
      } else {
        item = {
          type: 'character',
          name: randomReward.character_name || 'Unknown Character',
          src: randomReward.image_url || 'https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp',
          background: shopService.getRarityColor(randomReward.rarity),
          value: null
        };
      }
      
      items.push(item);
    }
    
    return items;
  };

  const generatePreviewRouletteItems = () => {
    const items = [];
    const totalItems = 40;
    
    for (let i = 0; i < totalItems; i++) {
      const isDiamond = Math.random() < 0.3;
      
      let item;
      if (isDiamond) {
        item = {
          type: 'diamonds',
          name: 'Diamonds',
          src: 'https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp',
          background: '#87CEEB',
          value: Math.floor(Math.random() * 1000) + 100
        };
      } else {
        const characters = [
          { name: 'Warrior', rarity: 'common' },
          { name: 'Mage', rarity: 'rare' },
          { name: 'Dragon', rarity: 'legendary' }
        ];
        const char = characters[Math.floor(Math.random() * characters.length)];
        
        item = {
          type: 'character',
          name: char.name,
          src: 'https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp',
          background: shopService.getRarityColor(char.rarity),
          value: null
        };
      }
      
      items.push(item);
    }
    
    return items;
  };

  const renderRouletteItems = (container, items) => {
    items.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "roulette-item";
      itemDiv.style.backgroundColor = item.background;

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
            {cases.map((caseData) => {
              const isLoadingThisCase = loadingCaseId === caseData.id;
              return (
                <div 
                  key={caseData.id}
                  className={`case-container ${shopService.getRarityClass(caseData.rarity)} ${isLoadingThisCase ? 'loading' : ''}`} 
                  onClick={() => handleCaseClick(caseData)}
                  style={{ pointerEvents: isLoadingThisCase ? 'none' : 'auto', opacity: isLoadingThisCase ? 0.7 : 1 }}
                >
                  <div className={`case-rarity ${shopService.getRarityClass(caseData.rarity)}-rarity`}>
                    {shopService.getRarityLabel(caseData.rarity)}
                  </div>
                  
                  {isLoadingThisCase && (
                    <div className="case-loading-overlay">
                      <div className="loading-spinner"></div>
                      <div className="loading-text">Opening...</div>
                    </div>
                  )}
                  
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
              );
            })}
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
                  inventory
                    .filter(item => item.character_name || item.name)
                    .sort((a, b) => {
                      // Sort by is_active first (active characters first), then by id
                      if (a.is_active && !b.is_active) return -1;
                      if (!a.is_active && b.is_active) return 1;
                      return a.id - b.id;
                    })
                    .map((character) => (
                    <div
                      key={character.id}
                      className={`case-container ${getRarityClass(character.rarity)} ${character.is_active ? 'active-character' : ''}`}
                    >
                      <div className={`case-rarity ${getRarityClass(character.rarity)}-rarity`}>
                        {shopService.getRarityLabel(character.rarity)}
                      </div>
                      
                      <img 
                        alt={character.character_name || character.name} 
                        className="case-image" 
                        src={character.src || character.image_url || `https://em-content.zobj.net/source/telegram/386/video-game_1f3ae.webp`}
                      />
                      
                      <div className="case-name">{character.character_name || character.name}</div>
                      
                      <div className="case-description">
                        Level {character.level} • {character.current_income_rate} 💎/hour
                      </div>
                      
                      <div className="character-actions">
                        <button
                          className="character-upgrade-btn"
                          onClick={() => handleUpgradeCharacterDirect(character)}
                          disabled={upgrading || getUserDiamonds() < character.upgrade_cost}
                        >
                          <span className="btn-icon">⬆️</span>
                          Upgrade {character.upgrade_cost} 💎
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

                        <button
                          className="character-sell-btn-compact"
                          onClick={() => handleSellClick(character)}
                          disabled={character.is_active}
                          title={character.is_active ? "Cannot sell active character" : 
                                 !isWalletConnected ? "Connect TON wallet to sell" : "Sell this character for TON"}
                        >
                          💰
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>
      )}

      {/* Render Sell Modal using Portal */}
      <SellModal 
        isOpen={showSellModal}
        character={selectedCharacterForSale}
        price={sellPrice}
        onPriceChange={handlePriceChange}
        onConfirm={handleSellSubmit}
        onCancel={handleSellCancel}
        selling={selling}
        isWalletConnected={isWalletConnected}
      />
    </div>
  );
} 