import React, { useState, useEffect } from 'react';
import { useShop } from '../api/hooks/useShop';
import { useGame } from '../context/GameContext';
import shopService from '../api/services/shopService';
import './Inventory.css';

const Inventory = () => {
  const { 
    inventory, 
    selectedCharacter, 
    loading, 
    error, 
    fetchInventory, 
    upgradeCharacter, 
    setActiveCharacter, 
    selectCharacter 
  } = useShop();
  
  const { user, updateUser } = useGame();
  const [upgrading, setUpgrading] = useState(false);
  const [settingActive, setSettingActive] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSelectCharacter = (character) => {
    selectCharacter(character);
  };

  const handleUpgradeCharacter = async () => {
    if (!selectedCharacter || upgrading) return;
    
    const upgradeCost = shopService.calculateUpgradeCost(selectedCharacter.level);
    
    if (user.diamonds < upgradeCost) {
      alert(`Not enough diamonds! Required: ${upgradeCost}, you have: ${user.diamonds}`);
      return;
    }

    setUpgrading(true);
    try {
      const result = await upgradeCharacter(selectedCharacter.id);
      if (result.success) {
        // Update user diamonds
        updateUser({ diamonds: user.diamonds - upgradeCost });
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
        alert(`${selectedCharacter.character_name} is now the active character!`);
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

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="loading">Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const characters = inventory.filter(item => item.character_name);

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Character Inventory</h2>
        <div className="inventory-stats">
          <span>Total characters: {characters.length}</span>
          <span>💎 {user.diamonds}</span>
        </div>
      </div>

      <div className="inventory-content">
        <div className="characters-grid">
          {characters.length === 0 ? (
            <div className="empty-inventory">
              <p>You don't have any characters yet</p>
              <p>Open cases in the shop to get characters!</p>
            </div>
          ) : (
            characters.map((character) => (
              <div
                key={character.id}
                className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''} ${getRarityClass(character.income_rate)}`}
                onClick={() => handleSelectCharacter(character)}
                style={{ '--rarity-color': getRarityColor(character.income_rate) }}
              >
                <div className="character-card-header">
                  <div className="character-level">Lvl. {character.level}</div>
                  {character.is_active && <div className="active-badge">Active</div>}
                </div>
                
                <div className="character-avatar">
                  <div className="character-icon">
                    {character.character_name === 'Crypto Miner' && '⛏️'}
                    {character.character_name === 'Diamond Hunter' && '💎'}
                    {character.character_name === 'Quantum Processor' && '🔬'}
                    {character.character_name === 'Legendary Dragon' && '🐉'}
                    {character.character_name === 'Space Explorer' && '🚀'}
                    {character.character_name === 'Magic Wizard' && '🧙‍♂️'}
                  </div>
                </div>

                <div className="character-info">
                  <h3 className="character-name">{character.character_name}</h3>
                  <div className="character-stats">
                    <div className="stat">
                      <span className="stat-label">Income/hour:</span>
                      <span className="stat-value">{character.income_rate}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rarity:</span>
                      <span className={`stat-value ${getRarityClass(character.income_rate)}`}>
                        {shopService.getCharacterRarity(character.income_rate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="character-card-footer">
                  <div className="upgrade-cost">
                    Upgrade: {shopService.calculateUpgradeCost(character.level)} 💎
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedCharacter && (
          <div className="character-details">
            <div className="details-header">
              <h3>Selected Character</h3>
              <button 
                className="close-details"
                onClick={() => selectCharacter(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-content">
              <div className="character-preview">
                <div className="character-avatar-large">
                  <div className="character-icon-large">
                    {selectedCharacter.character_name === 'Crypto Miner' && '⛏️'}
                    {selectedCharacter.character_name === 'Diamond Hunter' && '💎'}
                    {selectedCharacter.character_name === 'Quantum Processor' && '🔬'}
                    {selectedCharacter.character_name === 'Legendary Dragon' && '🐉'}
                    {selectedCharacter.character_name === 'Space Explorer' && '🚀'}
                    {selectedCharacter.character_name === 'Magic Wizard' && '🧙‍♂️'}
                  </div>
                </div>
                
                <div className="character-details-info">
                  <h4>{selectedCharacter.character_name}</h4>
                  <div className="detail-stats">
                    <div className="detail-stat">
                      <span>Level:</span>
                      <span>{selectedCharacter.level}</span>
                    </div>
                    <div className="detail-stat">
                      <span>Hourly income:</span>
                      <span>{selectedCharacter.income_rate} 💎</span>
                    </div>
                    <div className="detail-stat">
                      <span>Rarity:</span>
                      <span className={getRarityClass(selectedCharacter.income_rate)}>
                        {shopService.getCharacterRarity(selectedCharacter.income_rate)}
                      </span>
                    </div>
                    <div className="detail-stat">
                      <span>Status:</span>
                      <span>{selectedCharacter.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="character-actions">
                <button
                  className="upgrade-button"
                  onClick={handleUpgradeCharacter}
                  disabled={upgrading || user.diamonds < shopService.calculateUpgradeCost(selectedCharacter.level)}
                >
                  {upgrading ? 'Upgrading...' : `Upgrade for ${shopService.calculateUpgradeCost(selectedCharacter.level)} 💎`}
                </button>

                {!selectedCharacter.is_active && (
                  <button
                    className="activate-button"
                    onClick={handleSetActiveCharacter}
                    disabled={settingActive}
                  >
                    {settingActive ? 'Activating...' : 'Set as Active'}
                  </button>
                )}
              </div>

              <div className="upgrade-preview">
                <h5>After upgrade:</h5>
                <div className="upgrade-stats">
                  <div className="upgrade-stat">
                    <span>Level:</span>
                    <span>{selectedCharacter.level} → {selectedCharacter.level + 1}</span>
                  </div>
                  <div className="upgrade-stat">
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
  );
};

export default Inventory;