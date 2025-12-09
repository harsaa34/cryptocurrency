import { Coin, Currency } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const fetchCoins = async (
  page = 1,
  currency: Currency = 'usd',
  perPage = 20,
  query?: string
): Promise<{ coins: Coin[]; page: number; perPage: number; total: number; hasNextPage: boolean }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
      currency,
    });
    
    if (query) {
      params.append('query', query);
    }
    
    const response = await fetch(`${API_BASE}/crypto/coins?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coins:', error);
    throw error;
  }
};

export const fetchCoinById = async (id: string, currency: Currency = 'usd'): Promise<Coin> => {
  try {
    const response = await fetch(`${API_BASE}/crypto/coins/${id}?currency=${currency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin:', error);
    throw error;
  }
};

export const searchCoins = async (query: string): Promise<{ coins: any[]; query: string }> => {
  try {
    const response = await fetch(`${API_BASE}/crypto/search?query=${query}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching coins:', error);
    throw error;
  }
};
// Add chart data fetching function
export const fetchCoinChartData = async (
  coinId: string,
  currency: string = 'usd',
  days: number = 1
): Promise<ChartData> => {
  try {
    const response = await fetch(`${API_BASE}/crypto/chart/${coinId}?currency=${currency}&days=${days}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chart data:', error);
    // Return mock chart data
    return getMockChartData(days);
  }
};

// Add to your backend API in the backend
const getMockChartData = (days: number): ChartData => {
  const now = Date.now();
  const prices: [number, number][] = [];
  
  for (let i = 0; i < 24 * days; i++) {
    const timestamp = now - (24 * days - i) * 3600000;
    const basePrice = 45000;
    const variation = Math.sin(i / 10) * 500;
    const price = basePrice + variation + Math.random() * 200;
    prices.push([timestamp, price]);
  }
  
  return {
    prices,
    market_caps: prices.map(([ts, price]) => [ts, price * 21000000]),
    total_volumes: prices.map(([ts, price]) => [ts, price * 100000]),
  };
};

export const fetchWatchlistCoins = async (ids: string[], currency: Currency = 'usd'): Promise<{ coins: Coin[] }> => {
  try {
    const response = await fetch(`${API_BASE}/crypto/watchlist?ids=${ids.join(',')}&currency=${currency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching watchlist coins:', error);
    throw error;
  }
};