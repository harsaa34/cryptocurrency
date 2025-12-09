import React from 'react';
import { Coin } from '../types';

interface WatchlistProps {
  watchlistCoins: Coin[];
  onRemoveFromWatchlist: (coinId: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ watchlistCoins, onRemoveFromWatchlist }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (watchlistCoins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-yellow-400 text-6xl mb-4">⭐</div>
        <h3 className="text-2xl font-semibold text-white mb-2">Your watchlist is empty</h3>
        <p className="text-gray-400">Add coins to your watchlist to track them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {watchlistCoins.map((coin) => (
          <div key={coin.id} className="bg-primary rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full"
                  src={coin.image}
                  alt={coin.name}
                />
                <div>
                  <h3 className="font-bold text-white text-lg">{coin.name}</h3>
                  <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFromWatchlist(coin.id)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 transform hover:scale-110"
                aria-label="Remove from watchlist"
              >
                <span className="text-2xl">★</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-bold text-lg">
                  {formatCurrency(coin.current_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">24h Change:</span>
                <span className={`font-bold ${
                  coin.price_change_percentage_24h > 0 
                    ? 'text-positive' 
                    : coin.price_change_percentage_24h < 0 
                      ? 'text-negative' 
                      : 'text-neutral'
                }`}>
                  {coin.price_change_percentage_24h > 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Market Cap:</span>
                <span className="text-white font-medium">
                  {formatCurrency(coin.market_cap)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;