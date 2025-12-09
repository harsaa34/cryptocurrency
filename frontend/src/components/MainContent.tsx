import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import CoinTable from './CoinTable';
import Watchlist from './Watchlist';
import CoinDetails from './CoinDetails';
import { Coin, Currency, TimeRange } from '../types';

interface MainContentProps {
  activePage: 'markets' | 'watchlist';
  coins: Coin[];
  watchlist: Set<string>;
  watchlistCoins: Coin[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  sortField: keyof Coin | null;
  sortDirection: 'asc' | 'desc';
  currency: Currency;
  timeRange: TimeRange;
  onSearch: (query: string) => void;
  onToggleWatchlist: (coinId: string) => void;
  onRemoveFromWatchlist: (coinId: string) => void;
  onSort: (field: keyof Coin) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activePage,
  coins,
  watchlist,
  watchlistCoins,
  loading,
  error,
  searchQuery,
  currentPage,
  sortField,
  sortDirection,
  currency,
  timeRange,
  onSearch,
  onToggleWatchlist,
  onRemoveFromWatchlist,
  onSort,
  onPrevPage,
  onNextPage
}) => {
  const CoinDetailsWrapper = () => {
    const { id } = useParams<{ id: string }>();
    if (!id) return <Navigate to="/" />;
    
    return (
      <CoinDetails
        coinId={id}
        currency={currency}
        watchlist={watchlist}
        onToggleWatchlist={onToggleWatchlist}
      />
    );
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <Routes>
        <Route path="/" element={
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="relative w-full md:w-auto md:flex-1 max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search coins by name or symbol..."
                  className="pl-10 pr-4 py-3 w-full bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => {}}
                  className="px-4 py-3 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                >
                  <option value="1">24h</option>
                  <option value="7">7d</option>
                  <option value="30">30d</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {activePage === 'markets' ? (
              <>
                <CoinTable
                  coins={coins}
                  watchlist={watchlist}
                  onToggleWatchlist={onToggleWatchlist}
                  onSort={onSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  loading={loading}
                />
                
                <div className="flex justify-center items-center gap-6 mt-8">
                  <button
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    className={`px-6 py-2 rounded-xl font-bold transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                    }`}
                  >
                    ← Previous
                  </button>
                  <span className="text-white font-bold text-lg bg-blue-600 px-4 py-2 rounded-lg">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={onNextPage}
                    className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <Watchlist
                watchlistCoins={watchlistCoins}
                onRemoveFromWatchlist={onRemoveFromWatchlist}
              />
            )}
          </>
        } />
        
        <Route path="/coin/:id" element={<CoinDetailsWrapper />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </main>
  );
};

export default MainContent;