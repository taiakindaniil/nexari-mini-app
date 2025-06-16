import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function ShopAPI() {
  const { fetchGameStatus } = useGame();
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cases and inventory on component mount
  useEffect(() => {
    fetchCases();
    fetchInventory();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shop/cases', {
        headers: {
          'Authorization': `tma ${window.Telegram?.WebApp?.initData || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      
      const data = await response.json();
      setCases(data);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/shop/inventory', {
        headers: {
          'Authorization': `tma ${window.Telegram?.WebApp?.initData || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      
      const data = await response.json();
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleCaseClick = (caseData) => {
    if (isAnimationActive) return;
    
    // Determine payment method
    let paymentMethod = 'free';
    if (caseData.price_diamonds) {
      paymentMethod = 'diamonds';
    } else if (caseData.price_ton) {
      paymentMethod = 'ton';
    }
    
    showCaseAnimation(caseData, paymentMethod);
  };

  const purchaseCase = async (caseId, paymentMethod) => {
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `tma ${window.Telegram?.WebApp?.initData || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          case_id: caseId,
          payment_method: paymentMethod
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to purchase case');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error purchasing case:', err);
      throw err;
    }
  };

  const showCaseAnimation = (caseData, paymentMethod) => {
    setIsAnimationActive(true);

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "case-animation-overlay hidden";
    
    const message = document.createElement("div");
    message.className = "case-animation-message hidden";
    
    let priceText = "Free";
    if (paymentMethod === 'diamonds') {
      priceText = `${caseData.price_diamonds} Diamonds`;
    } else if (paymentMethod === 'ton') {
      priceText = `${caseData.price_ton} TON`;
    }
    
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
        
        // Purchase case from API
        const result = await purchaseCase(caseData.id, paymentMethod);
        
        if (!result.success) {
          alert(result.error || 'Failed to open case');
          onCancel();
          return;
        }
        
        const reward = result.reward;
        
        // Generate roulette items with the actual reward
        const rouletteItems = generateRouletteItems(reward);
        
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
            
            // Refresh game status and inventory
            fetchGameStatus();
            fetchInventory();
            
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

  const generateRouletteItems = (reward) => {
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
      { src: "https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp", name: "Diamonds" }
    ];

    const rouletteItems = [];
    
    for (let i = 0; i < 40; i++) {
      if (i === 19) {
        // Winner position
        rouletteItems.push(reward);
        continue;
      }

      // Random dummy item
      const randomItem = dummyItems[Math.floor(Math.random() * dummyItems.length)];
      rouletteItems.push({
        ...randomItem,
        is_mutated: randomItem.name !== "Diamonds" && Math.random() < 0.1,
        background: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        value: randomItem.name === "Diamonds" ? Math.floor(Math.random() * 250) + 1 : undefined,
      });
    }

    return rouletteItems;
  };

  const getRarityClass = (rarity) => {
    const rarityMap = {
      'common': 'common',
      'rare': 'rare',
      'epic': 'epic',
      'legendary': 'legendary',
      'premium': 'premium',
      'exclusive': 'exclusive'
    };
    return rarityMap[rarity] || 'common';
  };

  const getRarityLabel = (rarity) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
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
            setError(null);
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
                className={`case-container ${getRarityClass(caseData.rarity)}`} 
                onClick={() => handleCaseClick(caseData)}
              >
                <div className={`case-rarity ${getRarityClass(caseData.rarity)}-rarity`}>
                  {getRarityLabel(caseData.rarity)}
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