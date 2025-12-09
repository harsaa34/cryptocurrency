import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CoinDetails, Currency } from '../types';
import { fetchCoinById, fetchCoinChartData } from '../utils/api';
import PriceChart from './PriceChart';

interface CoinDetailsProps {
  coinId: string;
  currency: Currency;
  watchlist: Set<string>;
  onToggleWatchlist: (coinId: string) => void;
}

const CoinDetails: React.FC<CoinDetailsProps> = ({
  coinId,
  currency,
  watchlist,
  onToggleWatchlist
}) => {
  const [coin, setCoin] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<[number, number][]>([]);
  const [timeRange, setTimeRange] = useState<'1' | '7' | '30'>('1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoinData();
    loadChartData();
  }, [coinId, currency, timeRange]);

  const loadCoinData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCoinById(coinId, currency);
      setCoin(data as CoinDetails);
    } catch (err) {
      setError('Failed to load coin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const data = await fetchCoinChartData(coinId, currency, parseInt(timeRange));
      setChartData(data.prices);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Coin</h3>
        <p className="text-gray-400">{error || 'Coin not found'}</p>
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:text-blue-400">
          ← Back to Markets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link to="/" className="inline-flex items-center text-blue-500 hover:text-blue-400">
          <span className="mr-2">←</span>
          Back to Markets
        </Link>
      </div>

      {/* Coin Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{coin.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-400 uppercase">{coin.symbol}</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">
                  Rank #{coin.market_cap_rank}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onToggleWatchlist(coin.id)}
            className="text-2xl transition-transform duration-200 hover:scale-110"
            aria-label={watchlist.has(coin.id) ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watchlist.has(coin.id) ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-400">☆</span>
            )}
          </button>
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-white mb-1">
            {formatCurrency(coin.current_price)}
          </div>
          <div className={`text-lg font-medium ${
            coin.price_change_percentage_24h > 0 
              ? 'text-green-500' 
              : 'text-red-500'
          }`}>
            {formatPercentage(coin.price_change_percentage_24h)} (24h)
          </div>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2 mb-6">
          {(['1', '7', '30'] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                timeRange === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {days === '1' ? '24h' : `${days}d`}
            </button>
          ))}
        </div>

        {/* Price Chart */}
        {chartData.length > 0 && (
          <PriceChart
            prices={chartData}
            currency={currency}
            timeRange={timeRange}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h4 className="text-gray-400 text-sm mb-2">Market Cap</h4>
          <div className="text-xl font-bold text-white">
            {formatMarketCap(coin.market_cap)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h4 className="text-gray-400 text-sm mb-2">Volume (24h)</h4>
          <div className="text-xl font-bold text-white">
            {formatMarketCap(coin.total_volume)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h4 className="text-gray-400 text-sm mb-2">24h High</h4>
          <div className="text-xl font-bold text-white">
            {formatCurrency(coin.current_price * 1.05)} {/* Mock high */}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <h4 className="text-gray-400 text-sm mb-2">24h Low</h4>
          <div className="text-xl font-bold text-white">
            {formatCurrency(coin.current_price * 0.95)} {/* Mock low */}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {coin.description?.en && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">About {coin.name}</h3>
          <p className="text-gray-300 leading-relaxed">
            {coin.description.en.substring(0, 500)}...
            <button className="text-blue-500 hover:text-blue-400 ml-2">
              Read more
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default CoinDetails;