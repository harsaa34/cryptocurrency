import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import Notification from './components/Notification';
import { Currency, TimeRange, NotificationState } from './types';
import { fetchCoins, fetchCoinById } from './utils/api';
import MainContent from './components/MainContent';

type Page = 'markets' | 'watchlist';

function App() {
  const [activePage, setActivePage] = useState<Page>('markets');
  const [currency, setCurrency] = useState<Currency>('usd');
  const [timeRange, setTimeRange] = useState<TimeRange>('1');
  const [coins, setCoins] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [watchlistCoins, setWatchlistCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, show: true });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const loadCoins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCoins(currentPage, currency, 20, searchQuery || undefined);
      setCoins(data.coins || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load market data';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currency, searchQuery]);

  const loadWatchlistCoins = useCallback(async () => {
    const watchlistArray = Array.from(watchlist);
    if (watchlistArray.length === 0) {
      setWatchlistCoins([]);
      return;
    }

    try {
      const promises = watchlistArray.map(id => fetchCoinById(id, currency));
      const results = await Promise.all(promises);
      setWatchlistCoins(results.filter(coin => coin !== null));
    } catch (err) {
      console.error('Error loading watchlist:', err);
    }
  }, [watchlist, currency]);

  useEffect(() => {
    loadCoins();
  }, [loadCoins]);

  useEffect(() => {
    if (activePage === 'watchlist') {
      loadWatchlistCoins();
    }
  }, [activePage, watchlist, loadWatchlistCoins]);

  useEffect(() => {
    const storedWatchlist = localStorage.getItem('crypto-watchlist');
    if (storedWatchlist) {
      setWatchlist(new Set(JSON.parse(storedWatchlist)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('crypto-watchlist', JSON.stringify(Array.from(watchlist)));
  }, [watchlist]);

  const handleToggleWatchlist = (coinId: string) => {
    setWatchlist(prev => {
      const newWatchlist = new Set(prev);
      if (newWatchlist.has(coinId)) {
        newWatchlist.delete(coinId);
        showNotification('Removed from watchlist', 'info');
      } else {
        newWatchlist.add(coinId);
        showNotification('Added to watchlist', 'success');
      }
      return newWatchlist;
    });
  };

  const handleRemoveFromWatchlist = (coinId: string) => {
    setWatchlist(prev => {
      const newWatchlist = new Set(prev);
      newWatchlist.delete(coinId);
      return newWatchlist;
    });
    showNotification('Removed from watchlist', 'info');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setCurrentPage(1);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }

    const sorted = [...coins].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return 0;
    });

    setCoins(sorted);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header
          activePage={activePage}
          onPageChange={setActivePage}
          currency={currency}
          onCurrencyChange={setCurrency}
          watchlistCount={watchlist.size}
        />
        
        <MainContent
          activePage={activePage}
          coins={coins}
          watchlist={watchlist}
          watchlistCoins={watchlistCoins}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          currentPage={currentPage}
          sortField={sortField}
          sortDirection={sortDirection}
          currency={currency}
          timeRange={timeRange}
          onSearch={handleSearch}
          onToggleWatchlist={handleToggleWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          onSort={handleSort}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;