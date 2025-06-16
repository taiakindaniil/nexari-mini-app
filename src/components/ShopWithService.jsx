import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import shopService from '../api/services/shopService.ts';

export default function ShopWithService() {
  const { fetchGameStatus } = useGame();
  const {
    cases,
    inventory,
    loading,
    error,
    fetchCases,
    fetchInventory,
    purchaseCase,
    clearError
  } = useShop();
  
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');

  // Fetch data on component mount
  useEffect(() => {
    fetchCases();
    fetchInventory();
  }, [fetchCases, fetchInventory]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
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

  if (loading) {
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
                  className="inventory-item-container"
                  style={{ 
                    background: item.background || 'linear-gradient(135deg, #89f7fe, #66a6ff)',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                  }}
                >
                  <img 
                    src={item.src} 
                    alt={item.name} 
                    className={`inventory-image ${item.is_mutated ? 'mutated' : ''}`}
                  />
                  <div className="inventory-details">
                    <div className="inventory-name">{item.name}</div>
                    <div className="inventory-stats">
                      Lvl {item.level}, {item.income_rate}/h
                      {item.is_mutated && <span className="mutated-label">⚡ Mutated</span>}
                    </div>
                    <div className="inventory-acquired">
                      Acquired: {new Date(item.acquired_at).toLocaleDateString()}
                    </div>
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