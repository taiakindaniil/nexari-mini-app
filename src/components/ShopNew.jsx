import React, { useState } from 'react';
import { useGameAPI } from '../hooks/useGameAPI';
import { useCharacters } from '../hooks/useCharacters';

export default function ShopNew() {
  const { gameStatus } = useGameAPI();
  const { 
    shopCharacters, 
    inventory, 
    loading, 
    error,
    purchaseCharacter, 
    upgradeCharacter, 
    setActiveCharacter 
  } = useCharacters();
  
  const [activeTab, setActiveTab] = useState('shop');
  const [purchaseLoading, setPurchaseLoading] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(null);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handlePurchase = async (character) => {
    if (purchaseLoading) return;
    
    setPurchaseLoading(character.id);
    try {
      await purchaseCharacter(character.id);
      showMessage(`Successfully purchased ${character.name}!`);
    } catch (error) {
      alert(`Failed to purchase character: ${error.message}`);
    }
    setPurchaseLoading(null);
  };

  const handleUpgrade = async (userCharacter) => {
    if (upgradeLoading) return;
    
    setUpgradeLoading(userCharacter.id);
    try {
      const result = await upgradeCharacter(userCharacter.id);
      showMessage(`${userCharacter.name} upgraded to level ${result.character.level}!`);
    } catch (error) {
      alert(`Failed to upgrade character: ${error.message}`);
    }
    setUpgradeLoading(null);
  };

  const handleSetActive = async (userCharacter) => {
    try {
      await setActiveCharacter(userCharacter.id);
      showMessage(`${userCharacter.name} is now farming!`);
    } catch (error) {
      alert(`Failed to set active character: ${error.message}`);
    }
  };

  const showMessage = (text) => {
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #000;
      color: #fff;
      padding: 1rem;
      border-radius: 12px;
      z-index: 9999;
      max-width: 80%;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => {
      msg.remove();
    }, 2000);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#6B7280',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return colors[rarity] || colors.common;
  };

  if (loading && shopCharacters.length === 0 && inventory.length === 0) {
    return (
      <div className="shop-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-content">
      {/* Header with balance */}
      <div className="shop-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2>Character Shop</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
            alt="Diamonds" 
            style={{ width: '24px', height: '24px' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {Math.floor(gameStatus?.diamonds_balance || 0)}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={{
        display: 'flex',
        marginBottom: '20px',
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: '10px',
        padding: '5px'
      }}>
        <button
          className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('shop')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'shop' ? '#007bff' : 'transparent',
            color: activeTab === 'shop' ? 'white' : '#ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Shop ({shopCharacters.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('inventory')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            backgroundColor: activeTab === 'inventory' ? '#007bff' : 'transparent',
            color: activeTab === 'inventory' ? 'white' : '#ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Inventory ({inventory.length})
        </button>
      </div>

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="shop-grid">
          {shopCharacters.map((character) => {
            const isOwned = inventory.some(inv => inv.character_id === character.id);
            const canAfford = (gameStatus?.diamonds_balance || 0) >= character.base_price;
            const isPurchasing = purchaseLoading === character.id;
            
            return (
              <div 
                key={character.id} 
                className="character-card"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: `2px solid ${getRarityColor(character.rarity)}`,
                  opacity: isOwned ? 0.5 : 1
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <img 
                    src={character.image_url} 
                    alt={character.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${getRarityColor(character.rarity)}`
                    }}
                  />
                </div>
                
                <h3 style={{ 
                  textAlign: 'center', 
                  margin: '8px 0',
                  color: getRarityColor(character.rarity)
                }}>
                  {character.name}
                </h3>
                
                <p style={{ 
                  fontSize: '12px', 
                  color: '#ccc', 
                  textAlign: 'center',
                  margin: '8px 0'
                }}>
                  {character.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '12px 0'
                }}>
                  <span style={{ fontSize: '12px' }}>
                    {character.base_income_rate}/h
                  </span>
                  <span style={{ 
                    fontSize: '12px',
                    textTransform: 'capitalize',
                    color: getRarityColor(character.rarity)
                  }}>
                    {character.rarity}
                  </span>
                </div>
                
                <button
                  onClick={() => handlePurchase(character)}
                  disabled={isOwned || !canAfford || isPurchasing}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isOwned ? '#666' : !canAfford ? '#444' : '#28a745',
                    color: 'white',
                    cursor: isOwned || !canAfford ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: isPurchasing ? 0.5 : 1
                  }}
                >
                  {isPurchasing ? 'Purchasing...' : 
                   isOwned ? 'Owned' : 
                   !canAfford ? `Need ${character.base_price} 💎` :
                   character.base_price === 0 ? 'Free' : `${character.base_price} 💎`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="inventory-grid">
          {inventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#ccc' }}>
              <p>No characters in inventory</p>
              <p>Purchase characters from the shop!</p>
            </div>
          ) : (
            inventory.map((userCharacter) => {
              const isUpgrading = upgradeLoading === userCharacter.id;
              
              return (
                <div 
                  key={userCharacter.id} 
                  className="character-card"
                  style={{
                    backgroundColor: userCharacter.is_active ? 'rgba(40, 167, 69, 0.2)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: `2px solid ${userCharacter.is_active ? '#28a745' : getRarityColor(userCharacter.rarity)}`
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <img 
                      src={userCharacter.image_url} 
                      alt={userCharacter.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${getRarityColor(userCharacter.rarity)}`
                      }}
                    />
                    {userCharacter.is_active && (
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        ACTIVE
                      </div>
                    )}
                  </div>
                  
                  <h3 style={{ 
                    textAlign: 'center', 
                    margin: '8px 0',
                    color: getRarityColor(userCharacter.rarity)
                  }}>
                    {userCharacter.name}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '12px 0',
                    fontSize: '12px'
                  }}>
                    <span>Level {userCharacter.level}</span>
                    <span>{userCharacter.current_income_rate}/h</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!userCharacter.is_active && (
                      <button
                        onClick={() => handleSetActive(userCharacter)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Set Active
                      </button>
                    )}
                    
                    {userCharacter.can_upgrade && (
                      <button
                        onClick={() => handleUpgrade(userCharacter)}
                        disabled={!userCharacter.upgrade_cost || (gameStatus?.diamonds_balance || 0) < userCharacter.upgrade_cost || isUpgrading}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          borderRadius: '6px',
                          backgroundColor: (gameStatus?.diamonds_balance || 0) >= (userCharacter.upgrade_cost || 0) ? '#ffc107' : '#666',
                          color: 'white',
                          cursor: (gameStatus?.diamonds_balance || 0) >= (userCharacter.upgrade_cost || 0) ? 'pointer' : 'not-allowed',
                          fontSize: '12px',
                          opacity: isUpgrading ? 0.5 : 1
                        }}
                      >
                        {isUpgrading ? 'Upgrading...' : `Upgrade (${userCharacter.upgrade_cost} 💎)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style jsx>{`
        .shop-grid, .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          padding: 20px 0;
        }
        
        .character-card {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .character-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        @media (max-width: 768px) {
          .shop-grid, .inventory-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
} 