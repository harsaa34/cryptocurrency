export interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
  last_updated?: string;
}

export interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
}

export type Currency = 'usd' | 'eur' | 'gbp' | 'jpy';
export type TimeRange = '1' | '7' | '30';

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

export interface CoinResponse {
  coins: Coin[];
  page: number;
  perPage: number;
  total: number;
  hasNextPage: boolean;
}
// Add these interfaces
export interface ChartData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  marketCap: number;
  volume: number;
}

export interface CoinDetails extends Coin {
  description?: {
    en: string;
  };
  links?: {
    homepage: string[];
    blockchain_site: string[];
    repos_url: {
      github: string[];
    };
  };
  genesis_date?: string;
  hashing_algorithm?: string;
  community_data?: {
    facebook_likes: number;
    twitter_followers: number;
    reddit_average_posts_48h: number;
    reddit_average_comments_48h: number;
    reddit_subscribers: number;
  };
  developer_data?: {
    forks: number;
    stars: number;
    subscribers: number;
    total_issues: number;
    closed_issues: number;
  };
}