import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../api/hooks/useShop.ts';
import { useMarket } from '../api/hooks/useMarket.ts';
import { useTonConnect } from '../hooks/useTonConnect.ts';
import shopService from '../api/services/shopService.ts';
import { toUserFriendlyAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { beginCell } from '@ton/core';

const Market = () => {
  const { fetchInventory } = useShop();
  const {
    listings,
    myListings,
    loading,
    error,
    fetchListings,
    initiatePurchase,
    cancelListing,
    fetchMyListings,
    fetchStats,
    clearError,
    formatTon
  } = useMarket();

  const { wallet } = useTonConnect();

  const [tonConnectUI] = useTonConnectUI();

  const [activeTab, setActiveTab] = useState('browse'); // browse, my-listings
  const [characterFilter, setCharacterFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cancellingListings, setCancellingListings] = useState(new Set());
  const [purchasingListing, setPurchasingListing] = useState(null);
  const [hiddenListings, setHiddenListings] = useState(new Set());

  // Check if wallet is connected
  const isWalletConnected = !!wallet?.account?.address;

  // Debug logging
  console.log('Market component render:', {
    hiddenListings: Array.from(hiddenListings),
    listingsCount: listings.length,
    purchasingListing
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchListings();
    fetchMyListings();
    fetchStats();
    fetchInventory();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const filters = {
      character_filter: characterFilter || undefined,
      min_price_nanoton: minPrice ? parseFloat(minPrice) * 1_000_000_000 : undefined, // Convert TON to nanoTON
      max_price_nanoton: maxPrice ? parseFloat(maxPrice) * 1_000_000_000 : undefined, // Convert TON to nanoTON
      sort_by: sortBy
    };
    console.log('Applying filters, current hiddenListings:', Array.from(hiddenListings));
    fetchListings(filters);
  }, [characterFilter, minPrice, maxPrice, sortBy, fetchListings]);

  // Memoize filtered listings to preserve hiddenListings filter
  const visibleListings = useMemo(() => {
    const filtered = listings.filter(listing => {
      const isHidden = hiddenListings.has(listing.id);
      console.log(`Listing ${listing.id} (${listing.character.name}): hidden=${isHidden}`);
      return !isHidden;
    });
    console.log('Visible listings count:', filtered.length, 'out of', listings.length);
    return filtered;
  }, [listings, hiddenListings]);

  const handlePurchase = async (listing) => {
    if (!isWalletConnected) {
      alert('Please connect your TON wallet to purchase characters.');
      return;
    }

    console.log(listing);
    
    setPurchasingListing(listing.id);
    
    try {
      const result = await initiatePurchase({ listing_id: listing.id });
      
      if (result.success && result.payment_required) {
        const details = result.transaction_details;

        console.log(details);
        
        // Show success message with expiration time
        const expiresAt = new Date(details.expires_at);
        const timeRemaining = Math.round((expiresAt - new Date()) / 1000 / 60); // minutes
        
        const confirmPurchase = window.confirm(
          `Purchase initiated successfully!\n\n` +
          `Character: ${details.character_name} (Level ${details.character_level})\n` +
          `Price: ${details.price_ton} TON\n` +
          `Time remaining: ${timeRemaining} minutes\n\n` +
          `Click OK to send TON payment now.`
        );
        
        if (!confirmPurchase) {
          setPurchasingListing(null);
          return;
        }
        
        try {
          // Send TON transaction with UUID in payload for monitoring
          await tonConnectUI.sendTransaction({
            validUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
            messages: [
              {
                address: toUserFriendlyAddress(listing.wallet_address),
                amount: (listing.price_nanoton * 0.95).toFixed(0),
                payload: beginCell().storeUint(0, 32).storeStringTail(details.transaction_uuid).endCell().toBoc().toString('base64') // UUID for tracking
              },
              {
                address: toUserFriendlyAddress('0:0000000000000000000000000000000000000000000000000000000000000000'),
                amount: (listing.price_nanoton * 0.05).toFixed(0),
              }
            ]
          }, {
            onSuccess: () => {
              console.log('Transaction successful, hiding listing:', listing.id);
              setHiddenListings(prev => {
                const newHidden = new Set([...prev, listing.id]);
                console.log('Updated hiddenListings:', newHidden);
                return newHidden;
              });
              
              alert(`Payment sent successfully!\n\nTransaction UUID: ${details.transaction_uuid}\n\nYour purchase will be completed automatically when the payment is confirmed on the blockchain. This usually takes 1-2 minutes.`);
            },
            onError: (error) => {
              console.error('TON transaction error:', error);
              alert('Failed to send TON payment. The transaction reservation will expire in 15 minutes if not completed.');
            }
          });
          
        } catch (tonError) {
          console.error('TON transaction error:', tonError);
          alert('Failed to send TON transaction. The transaction reservation will expire in 15 minutes if not completed.');
        }
      } else {
        // Handle server errors with better messages for race conditions
        if (result.error && result.error.includes('currently being purchased')) {
          alert('⏳ This item is currently being purchased by another user.\n\nPlease try again in a few minutes or choose a different character.');
        } else if (result.error && result.error.includes('just purchased')) {
          alert('😔 Someone just purchased this item before you.\n\nPlease refresh the market and try a different character.');
          // Auto-refresh listings after race condition
          setTimeout(() => {
            fetchListings();
          }, 1000);
        } else {
          alert(result.error || 'Failed to initiate purchase');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      if (error.message && error.message.includes('500')) {
        alert('Server error occurred. Please try again in a moment.');
      } else {
        alert('Failed to purchase. Please try again.');
      }
    } finally {
      setPurchasingListing(null);
    }
  };

  const handleCancelListing = async (listing) => {
    // Add listing ID to loading state
    setCancellingListings(prev => new Set([...prev, listing.id]));
    
    try {
      const result = await cancelListing(listing.id);
      
      if (result.success) {
        // Refresh inventory without requesting listings again
        await fetchInventory();
        alert(`Listing for ${listing.character.name} has been cancelled`);
      } else {
        alert(result.error || 'Failed to cancel listing');
      }
    } finally {
      // Remove listing ID from loading state
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

      {/* Wallet Status */}
      {!isWalletConnected && (
        <div className="wallet-warning-banner">
          <span>⚠️ Connect your TON wallet to purchase characters</span>
        </div>
      )}

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
                placeholder="Min Price (TON)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                step="0.001"
              />
            </div>

            <div className="filter-group">
              <div className="filter-icon">💎</div>
              <input
                type="number"
                className="modern-filter-input"
                placeholder="Max Price (TON)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                step="0.001"
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
            ) : visibleListings.length === 0 ? (
              <div className="empty-market">
                <p>No items in the market</p>
                <p>Be the first to sell something!</p>
              </div>
            ) : (
              visibleListings.map(listing => (
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
                    disabled={!isWalletConnected || purchasingListing === listing.id}
                  >
                    {purchasingListing === listing.id ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>{formatTon(listing.price_nanoton)} TON</span>
                      </>
                    )}
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
                    Price: {formatTon(listing.price_nanoton)} TON
                  </div>
                  <div className="wallet-address">
                    Wallet: {listing.wallet_address.slice(0, 6)}...{listing.wallet_address.slice(-4)}
                  </div>
                  
                  <button 
                    className={`cancel-listing-button ${cancellingListings.has(listing.id) ? 'loading' : ''}`}
                    onClick={() => handleCancelListing(listing)}
                    disabled={cancellingListings.has(listing.id)}
                  >
                    <span className="button-text">Cancel Listing</span>
                    {cancellingListings.has(listing.id) && (
                      <div className="button-loading-overlay">
                        <div className="loading-spinner"></div>
                        <span>Cancelling...</span>
                      </div>
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