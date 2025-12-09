import React from 'react';
import { Link } from 'react-router-dom';
import { Coin } from '../types';

interface CoinTableProps {
  coins: Coin[];
  watchlist: Set<string>;
  onToggleWatchlist: (coinId: string) => void;
  onSort: (field: keyof Coin) => void;
  sortField: keyof Coin | null;
  sortDirection: 'asc' | 'desc';
  loading: boolean;
}

const CoinTable: React.FC<CoinTableProps> = ({
  coins,
  watchlist,
  onToggleWatchlist,
  onSort,
  sortField,
  sortDirection,
  loading
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getSortIcon = (field: keyof Coin) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-lg">Loading market data...</p>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white text-lg">No coins found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr className="bg-gray-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Coin
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-200"
              onClick={() => onSort('current_price')}
            >
              <div className="flex items-center gap-1">
                Price
                <span className="text-xs">{getSortIcon('current_price')}</span>
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-200"
              onClick={() => onSort('price_change_percentage_24h')}
            >
              <div className="flex items-center gap-1">
                24h %
                <span className="text-xs">{getSortIcon('price_change_percentage_24h')}</span>
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-200"
              onClick={() => onSort('market_cap')}
            >
              <div className="flex items-center gap-1">
                Market Cap
                <span className="text-xs">{getSortIcon('market_cap')}</span>
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors duration-200"
              onClick={() => onSort('total_volume')}
            >
              <div className="flex items-center gap-1">
                Volume (24h)
                <span className="text-xs">{getSortIcon('total_volume')}</span>
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Watch
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {coins.map((coin) => (
            <tr key={coin.id} className="hover:bg-gray-700 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {coin.market_cap_rank}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="w-8 h-8 rounded-full mr-3"
                    src={coin.image}
                    alt={coin.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32';
                    }}
                  />
                  <div>
                    <Link 
                      to={`/coin/${coin.id}`}
                      className="text-sm font-medium text-white hover:text-blue-400 transition-colors duration-200 flex items-center group"
                    >
                      {coin.name}
                      <svg 
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    <div className="text-sm text-gray-400 uppercase">{coin.symbol}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                {formatCurrency(coin.current_price)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                coin.price_change_percentage_24h > 0 
                  ? 'text-green-500' 
                  : coin.price_change_percentage_24h < 0 
                    ? 'text-red-500' 
                    : 'text-yellow-500'
              }`}>
                <div className="flex items-center">
                  {formatPercentage(coin.price_change_percentage_24h)}
                  {coin.price_change_percentage_24h > 0 ? (
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : coin.price_change_percentage_24h < 0 ? (
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatMarketCap(coin.market_cap)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatVolume(coin.total_volume)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onToggleWatchlist(coin.id)}
                  className="text-gray-400 hover:text-yellow-400 transition-all duration-200 transform hover:scale-110 p-1 rounded-full hover:bg-gray-600"
                  aria-label={watchlist.has(coin.id) ? "Remove from watchlist" : "Add to watchlist"}
                  title={watchlist.has(coin.id) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {watchlist.has(coin.id) ? (
                    <span className="text-yellow-400 text-xl">★</span>
                  ) : (
                    <span className="text-xl">☆</span>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinTable;