import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useShop } from '../api/hooks/useShop.ts';
import { useMarket } from '../api/hooks/useMarket.ts';
import shopService from '../api/services/shopService.ts';

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
  const { gameStatus, fetchGameStatus } = useGame();
  const { fetchInventory } = useShop();
  const {
    listings,
    myListings,
    stats,
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
    const result = await cancelListing(listing.id);
    
    if (result.success) {
      await fetchInventory(); // Refresh inventory
      alert(`Listing for ${listing.character.name} has been cancelled`);
    } else {
      alert(result.error || 'Failed to cancel listing');
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
        <div className="browse-market-tab">
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
                    <span>Buy for {listing.price}</span>
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
        <div className="my-listings-tab">
          <h3>My Active Listings</h3>
          
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
                    disabled={loading}
                  >
                    Cancel Listing
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