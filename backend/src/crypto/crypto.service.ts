import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Coin, CoinResponse } from './entities/coin.entity';
import { SearchResponse } from './entities/search-result.entity';
import { GetCoinsDto } from './dto/get-coins.dto';

@Injectable()
export class CryptoService {
  private readonly API_BASE = 'https://api.coingecko.com/api/v3';
  private readonly ALTERNATIVE_API = 'https://api.coincap.io/v2';
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  async getCoins(getCoinsDto: GetCoinsDto): Promise<CoinResponse> {
    const { page = 1, perPage = 20, currency = 'usd', query } = getCoinsDto;
    
    const cacheKey = `coins:${page}:${perPage}:${currency}:${query || 'all'}`;
    
    // Try to get from cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as CoinResponse;
    }

    try {
      // Add delay to avoid rate limiting
      await this.delay(this.RATE_LIMIT_DELAY);
      
      let coins: Coin[] = [];
      
      if (query) {
        // Search coins
        const searchResponse = await lastValueFrom(
          this.httpService.get(`${this.API_BASE}/search?query=${encodeURIComponent(query)}`, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CryptoDashboard/1.0'
            },
            timeout: 10000
          }),
        );
        
        const coinIds = searchResponse.data.coins
          ?.slice(0, perPage)
          ?.map((coin: any) => coin.id)
          ?.join(',');
          
        if (coinIds) {
          // Add another delay between requests
          await this.delay(this.RATE_LIMIT_DELAY);
          
          const coinsResponse = await lastValueFrom(
            this.httpService.get(
              `${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${coinIds}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`,
              {
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'CryptoDashboard/1.0'
                },
                timeout: 10000
              }
            ),
          );
          coins = coinsResponse.data || [];
        }
      } else {
        // Get paginated coins
        const response = await lastValueFrom(
          this.httpService.get(
            `${this.API_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'CryptoDashboard/1.0'
              },
              timeout: 10000
            }
          ),
        );
        coins = response.data || [];
      }

      const result: CoinResponse = {
        coins,
        page,
        perPage,
        total: coins.length,
        hasNextPage: coins.length === perPage,
      };

      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, result, 300000);
      
      return result;
    } catch (error) {
      console.error('Error fetching coins from CoinGecko:', error.message);
      
      // Try alternative API
      try {
        console.log('Trying alternative API...');
        const alternativeCoins = await this.getCoinsFromAlternativeAPI(page, perPage, currency);
        
        const result: CoinResponse = {
          coins: alternativeCoins,
          page,
          perPage,
          total: alternativeCoins.length,
          hasNextPage: alternativeCoins.length === perPage,
        };
        
        // Cache for shorter time since it's alternative data
        await this.cacheManager.set(cacheKey, result, 60000); // 1 minute cache
        
        return result;
      } catch (altError) {
        console.error('Alternative API also failed:', altError.message);
        throw new Error('Failed to fetch coins from all sources');
      }
    }
  }

  async getCoinById(id: string, currency: string = 'usd'): Promise<Coin> {
    const cacheKey = `coin:${id}:${currency}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Coin;
    }

    try {
      // Add delay to avoid rate limiting
      await this.delay(this.RATE_LIMIT_DELAY);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${id}&order=market_cap_desc&sparkline=false`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CryptoDashboard/1.0'
            },
            timeout: 10000
          }
        ),
      );
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`Coin ${id} not found`);
      }
      
      const coin = response.data[0];
      await this.cacheManager.set(cacheKey, coin, 300000);
      
      return coin;
    } catch (error) {
      console.error(`Error fetching coin ${id}:`, error.message);
      
      // Try alternative API
      try {
        const alternativeCoin = await this.getCoinFromAlternativeAPI(id, currency);
        await this.cacheManager.set(cacheKey, alternativeCoin, 60000);
        return alternativeCoin;
      } catch (altError) {
        throw new Error(`Failed to fetch coin ${id}: ${error.message}`);
      }
    }
  }

  async getChartData(id: string, currency: string, days: number): Promise<any> {
    const cacheKey = `chart:${id}:${currency}:${days}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Add delay to avoid rate limiting
      await this.delay(this.RATE_LIMIT_DELAY);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.API_BASE}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CryptoDashboard/1.0'
            },
            timeout: 15000
          }
        ),
      );
      
      const chartData = response.data;
      
      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, chartData, 300000);
      
      return chartData;
    } catch (error) {
      console.error('Error fetching chart data:', error.message);
      throw new Error(`Failed to fetch chart data for ${id}: ${error.message}`);
    }
  }

  async searchCoins(query: string): Promise<SearchResponse> {
    const cacheKey = `search:${query}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as SearchResponse;
    }

    try {
      // Add delay to avoid rate limiting
      await this.delay(this.RATE_LIMIT_DELAY);
      
      const response = await lastValueFrom(
        this.httpService.get(`${this.API_BASE}/search?query=${encodeURIComponent(query)}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoDashboard/1.0'
          },
          timeout: 10000
        }),
      );
      
      const result: SearchResponse = {
        coins: response.data.coins?.slice(0, 20) || [],
        query,
        timestamp: new Date().toISOString(),
      };
      
      await this.cacheManager.set(cacheKey, result, 300000);
      
      return result;
    } catch (error) {
      console.error('Error searching coins:', error.message);
      throw new Error(`Failed to search coins: ${error.message}`);
    }
  }

  async getWatchlistCoins(ids: string[], currency: string = 'usd'): Promise<Coin[]> {
    if (ids.length === 0) {
      return [];
    }

    const cacheKey = `watchlist:${ids.join(',')}:${currency}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as Coin[];
    }

    try {
      // Add delay to avoid rate limiting
      await this.delay(this.RATE_LIMIT_DELAY);
      
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&order=market_cap_desc&sparkline=false`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CryptoDashboard/1.0'
            },
            timeout: 10000
          }
        ),
      );
      
      const coins = response.data || [];
      await this.cacheManager.set(cacheKey, coins, 300000);
      
      return coins;
    } catch (error) {
      console.error('Error fetching watchlist coins:', error.message);
      throw new Error(`Failed to fetch watchlist coins: ${error.message}`);
    }
  }

  // Alternative API methods
  private async getCoinsFromAlternativeAPI(page: number, perPage: number, currency: string): Promise<Coin[]> {
    try {
      // CoinCap API doesn't support pagination directly, so we fetch all and slice
      const response = await lastValueFrom(
        this.httpService.get(`${this.ALTERNATIVE_API}/assets?limit=100`, {
          headers: {
            'Accept': 'application/json'
          },
          timeout: 10000
        }),
      );
      
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      
      return response.data.data
        .slice(startIndex, endIndex)
        .map((asset: any, index: number) => ({
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol.toLowerCase(),
          current_price: parseFloat(asset.priceUsd),
          price_change_percentage_24h: parseFloat(asset.changePercent24Hr),
          market_cap: parseFloat(asset.marketCapUsd),
          total_volume: parseFloat(asset.volumeUsd24Hr),
          image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
          market_cap_rank: startIndex + index + 1,
          last_updated: new Date().toISOString(),
        }));
    } catch (error) {
      throw new Error(`Alternative API failed: ${error.message}`);
    }
  }

  private async getCoinFromAlternativeAPI(id: string, currency: string): Promise<Coin> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.ALTERNATIVE_API}/assets/${id}`, {
          headers: {
            'Accept': 'application/json'
          },
          timeout: 10000
        }),
      );
      
      const asset = response.data.data;
      
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol.toLowerCase(),
        current_price: parseFloat(asset.priceUsd),
        price_change_percentage_24h: parseFloat(asset.changePercent24Hr),
        market_cap: parseFloat(asset.marketCapUsd),
        total_volume: parseFloat(asset.volumeUsd24Hr),
        image: `https://assets.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`,
        market_cap_rank: parseInt(asset.rank),
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Alternative API failed for ${id}: ${error.message}`);
    }
  }

  // Helper method to add delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}