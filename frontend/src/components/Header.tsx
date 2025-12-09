import React from 'react';
import { Currency } from '../types';

interface HeaderProps {
  activePage: 'markets' | 'watchlist';
  onPageChange: (page: 'markets' | 'watchlist') => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  watchlistCount: number;
}

const Header: React.FC<HeaderProps> = ({
  activePage,
  onPageChange,
  currency,
  onCurrencyChange,
  watchlistCount
}) => {
  return (
    <header className="bg-primary text-white p-4 md:p-6 rounded-xl shadow-lg sticky top-4 mx-4 md:mx-auto max-w-7xl">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-4 md:mb-0">
          <span className="text-yellow-400">💰</span>
          Crypto Dashboard
        </h1>
        
        <nav className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
          <button
            onClick={() => onPageChange('markets')}
            className={`font-medium px-3 py-1 relative transition-colors duration-200 ${
              activePage === 'markets' 
                ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Markets
          </button>
          
          <button
            onClick={() => onPageChange('watchlist')}
            className={`font-medium px-3 py-1 relative flex items-center gap-1 transition-colors duration-200 ${
              activePage === 'watchlist' 
                ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Watchlist
            <span className="bg-yellow-500 text-black text-xs rounded-full px-2 py-1 min-w-6 text-center">
              {watchlistCount}
            </span>
          </button>
          
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="bg-primary-dark text-white px-3 py-1 rounded border-none focus:ring-2 focus:ring-yellow-500 outline-none transition-all duration-200"
          >
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
            <option value="gbp">GBP</option>
            <option value="jpy">JPY</option>
          </select>
        </nav>
      </div>
    </header>
  );
};

export default Header;