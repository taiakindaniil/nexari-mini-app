import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import { useMarket } from '../api/hooks/useMarket.ts';
import shopService from '../api/services/shopService.ts';

const Market = () => {
  const { gameStatus, fetchGameStatus } = useGame();
  const { fetchInventory } = useShop();
  const {
    listings,
    myListings,
    loading,
    error,
    fetchListings,
    purchase,
    cancelListing,
    fetchMyListings,
    fetchStats,
    clearError
  } = useMarket();

  const [activeTab, setActiveTab] = useState('browse'); // browse, my-listings
  const [characterFilter, setCharacterFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cancellingListings, setCancellingListings] = useState(new Set()); // Состояние для отслеживания загрузки отмены

  // Fetch data on component mount
  useEffect(() => {
    fetchListings();
    fetchMyListings();
    fetchStats();
    fetchInventory();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const minPriceNum = minPrice ? parseInt(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseInt(maxPrice) : undefined;
    fetchListings(characterFilter || undefined, minPriceNum, maxPriceNum, sortBy);
  }, [characterFilter, minPrice, maxPrice, sortBy]);

  const getUserDiamonds = () => {
    return gameStatus?.diamonds_balance || 0;
  };

  const handlePurchase = async (listing) => {
    if (getUserDiamonds() < listing.price) {
      alert(`Not enough diamonds! You need ${listing.price} diamonds but have ${getUserDiamonds()}.`);
      return;
    }

    const result = await purchase({ listing_id: listing.id });
    
    if (result.success) {
      await fetchGameStatus(); // Refresh balance
      await fetchInventory(); // Refresh inventory
      alert(`Successfully purchased ${listing.character.name} (Level ${listing.character.level}) for ${listing.price} diamonds!`);
    } else {
      alert(result.error || 'Failed to purchase');
    }
  };



  const handleCancelListing = async (listing) => {
    // Добавляем ID листинга в состояние загрузки
    setCancellingListings(prev => new Set([...prev, listing.id]));
    
    try {
      const result = await cancelListing(listing.id);
      
      if (result.success) {
        // Обновляем только инвентарь, без запроса списка листингов
        await fetchInventory();
        alert(`Listing for ${listing.character.name} has been cancelled`);
      } else {
        alert(result.error || 'Failed to cancel listing');
      }
    } finally {
      // Убираем ID листинга из состояния загрузки
      setCancellingListings(prev => {
        const newSet = new Set(prev);
        newSet.delete(listing.id);
        return newSet;
      });
    }
  };



  if (error) {
    return (
      <div className="market-container visible">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => {
            clearError();
            fetchListings();
            fetchMyListings();
            fetchStats();
          }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="market-container visible">
      {/* Tab Switcher */}
      <div className="tab-switcher">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <span className="tab-icon">🛒</span>
          Browse
        </button>

        <button 
          className={`tab-button ${activeTab === 'my-listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-listings')}
        >
          <span className="tab-icon">📋</span>
          My Listings ({myListings.length})
        </button>
      </div>

      {/* Market Stats */}
      {/* {stats && (
        <div className="market-stats">
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            Active Listings: {stats.active_listings}
          </div>
          <div className="stat-item">
            <span className="stat-icon">💎</span>
            Your Diamonds: {getUserDiamonds()}
          </div>
          <div className="stat-item">
            <span className="stat-icon">🤝</span>
            Total Transactions: {stats.total_transactions}
          </div>
        </div>
      )} */}

      {/* Browse Market Tab */}
      {activeTab === 'browse' && (
        <div className="browse-market-tab" style={{width: '100%'}}>
          {/* Filters */}
          <div className="market-filters">
            <div className="filter-group">
              <div className="filter-icon">🎭</div>
              <select 
                className="modern-filter-select" 
                value={characterFilter}
                onChange={(e) => setCharacterFilter(e.target.value)}
              >
                <option value="">All Characters</option>
                {[...new Set(listings.map(l => l.character.name))].map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <div className="filter-icon">💎</div>
              <input
                type="number"
                className="modern-filter-input"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div className="filter-icon">💎</div>
              <input
                type="number"
                className="modern-filter-input"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <div className="filter-icon">📊</div>
              <select 
                className="modern-filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="level_desc">Level: High to Low</option>
              </select>
            </div>
          </div>

          {/* Market Items Grid */}
          <div className="market-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div>Loading market...</div>
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-market">
                <p>No items in the market</p>
                <p>Be the first to sell something!</p>
              </div>
            ) : (
              listings.map(listing => (
                <div 
                  key={listing.id} 
                  className={`case-container ${shopService.getRarityClass(listing.character.rarity)}`}
                >
                  <div className={`case-rarity ${shopService.getRarityClass(listing.character.rarity)}-rarity`}>
                    {shopService.getRarityLabel(listing.character.rarity)}
                  </div>
                  
                  <img 
                    src={listing.character.image_url} 
                    alt={listing.character.name} 
                    className="case-image"
                  />
                  
                  <div className="case-name">{listing.character.name}</div>
                  <div className="case-description">
                    Level {listing.character.level} • {listing.character.income_rate} 💎/hour
                  </div>
                  <div className="seller-info">
                    Seller: {listing.seller_name}
                  </div>
                  
                  <button 
                    className="market-buy-button" 
                    onClick={() => handlePurchase(listing)}
                    disabled={loading || getUserDiamonds() < listing.price}
                  >
                    <span>{listing.price}</span>
                    <img 
                      src="https://em-content.zobj.net/source/telegram/386/gem-stone_1f48e.webp" 
                      alt="Diamonds" 
                      className="button-gem-icon"
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}



      {/* My Listings Tab */}
      {activeTab === 'my-listings' && (
        <div className="my-listings-tab" style={{width: '100%'}}>          
          <div className="market-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div>Loading your listings...</div>
              </div>
            ) : myListings.length === 0 ? (
              <div className="empty-listings">
                <p>You don't have any active listings</p>
                <p>Go to Inventory to sell your characters!</p>
              </div>
            ) : (
              myListings.map(listing => (
                <div 
                  key={listing.id} 
                  className={`case-container ${shopService.getRarityClass(listing.character.rarity)}`}
                >
                  <div className={`case-rarity ${shopService.getRarityClass(listing.character.rarity)}-rarity`}>
                    {shopService.getRarityLabel(listing.character.rarity)}
                  </div>
                  
                  <img 
                    src={listing.character.image_url} 
                    alt={listing.character.name} 
                    className="case-image"
                  />
                  
                  <div className="case-name">{listing.character.name}</div>
                  <div className="case-description">
                    Level {listing.character.level}
                  </div>
                  <div className="listing-price">
                    Price: {listing.price} 💎
                  </div>
                  
                  <button 
                    className="cancel-listing-button" 
                    onClick={() => handleCancelListing(listing)}
                    disabled={cancellingListings.has(listing.id)}
                  >
                    {cancellingListings.has(listing.id) ? (
                      <>
                        <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Listing'
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Market; 