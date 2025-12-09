"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let CryptoService = class CryptoService {
    httpService;
    cacheManager;
    API_BASE = 'https://api.coingecko.com/api/v3';
    ALTERNATIVE_API = 'https://api.coincap.io/v2';
    RATE_LIMIT_DELAY = 1000;
    constructor(httpService, cacheManager) {
        this.httpService = httpService;
        this.cacheManager = cacheManager;
    }
    async getCoins(getCoinsDto) {
        const { page = 1, perPage = 20, currency = 'usd', query } = getCoinsDto;
        const cacheKey = `coins:${page}:${perPage}:${currency}:${query || 'all'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            let coins = [];
            if (query) {
                const searchResponse = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/search?query=${encodeURIComponent(query)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'CryptoDashboard/1.0'
                    },
                    timeout: 10000
                }));
                const coinIds = searchResponse.data.coins
                    ?.slice(0, perPage)
                    ?.map((coin) => coin.id)
                    ?.join(',');
                if (coinIds) {
                    await this.delay(this.RATE_LIMIT_DELAY);
                    const coinsResponse = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${coinIds}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`, {
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'CryptoDashboard/1.0'
                        },
                        timeout: 10000
                    }));
                    coins = coinsResponse.data || [];
                }
            }
            else {
                const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'CryptoDashboard/1.0'
                    },
                    timeout: 10000
                }));
                coins = response.data || [];
            }
            const result = {
                coins,
                page,
                perPage,
                total: coins.length,
                hasNextPage: coins.length === perPage,
            };
            await this.cacheManager.set(cacheKey, result, 300000);
            return result;
        }
        catch (error) {
            console.error('Error fetching coins from CoinGecko:', error.message);
            try {
                console.log('Trying alternative API...');
                const alternativeCoins = await this.getCoinsFromAlternativeAPI(page, perPage, currency);
                const result = {
                    coins: alternativeCoins,
                    page,
                    perPage,
                    total: alternativeCoins.length,
                    hasNextPage: alternativeCoins.length === perPage,
                };
                await this.cacheManager.set(cacheKey, result, 60000);
                return result;
            }
            catch (altError) {
                console.error('Alternative API also failed:', altError.message);
                throw new Error('Failed to fetch coins from all sources');
            }
        }
    }
    async getCoinById(id, currency = 'usd') {
        const cacheKey = `coin:${id}:${currency}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${id}&order=market_cap_desc&sparkline=false`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'CryptoDashboard/1.0'
                },
                timeout: 10000
            }));
            if (!response.data || response.data.length === 0) {
                throw new Error(`Coin ${id} not found`);
            }
            const coin = response.data[0];
            await this.cacheManager.set(cacheKey, coin, 300000);
            return coin;
        }
        catch (error) {
            console.error(`Error fetching coin ${id}:`, error.message);
            try {
                const alternativeCoin = await this.getCoinFromAlternativeAPI(id, currency);
                await this.cacheManager.set(cacheKey, alternativeCoin, 60000);
                return alternativeCoin;
            }
            catch (altError) {
                throw new Error(`Failed to fetch coin ${id}: ${error.message}`);
            }
        }
    }
    async getChartData(id, currency, days) {
        const cacheKey = `chart:${id}:${currency}:${days}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'CryptoDashboard/1.0'
                },
                timeout: 15000
            }));
            const chartData = response.data;
            await this.cacheManager.set(cacheKey, chartData, 300000);
            return chartData;
        }
        catch (error) {
            console.error('Error fetching chart data:', error.message);
            throw new Error(`Failed to fetch chart data for ${id}: ${error.message}`);
        }
    }
    async searchCoins(query) {
        const cacheKey = `search:${query}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'CryptoDashboard/1.0'
                },
                timeout: 10000
            }));
            const result = {
                coins: response.data.coins?.slice(0, 20) || [],
                query,
                timestamp: new Date().toISOString(),
            };
            await this.cacheManager.set(cacheKey, result, 300000);
            return result;
        }
        catch (error) {
            console.error('Error searching coins:', error.message);
            throw new Error(`Failed to search coins: ${error.message}`);
        }
    }
    async getWatchlistCoins(ids, currency = 'usd') {
        if (ids.length === 0) {
            return [];
        }
        const cacheKey = `watchlist:${ids.join(',')}:${currency}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            await this.delay(this.RATE_LIMIT_DELAY);
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.API_BASE}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&order=market_cap_desc&sparkline=false`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'CryptoDashboard/1.0'
                },
                timeout: 10000
            }));
            const coins = response.data || [];
            await this.cacheManager.set(cacheKey, coins, 300000);
            return coins;
        }
        catch (error) {
            console.error('Error fetching watchlist coins:', error.message);
            throw new Error(`Failed to fetch watchlist coins: ${error.message}`);
        }
    }
    async getCoinsFromAlternativeAPI(page, perPage, currency) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.ALTERNATIVE_API}/assets?limit=100`, {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 10000
            }));
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            return response.data.data
                .slice(startIndex, endIndex)
                .map((asset, index) => ({
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
        }
        catch (error) {
            throw new Error(`Alternative API failed: ${error.message}`);
        }
    }
    async getCoinFromAlternativeAPI(id, currency) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.ALTERNATIVE_API}/assets/${id}`, {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 10000
            }));
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
        }
        catch (error) {
            throw new Error(`Alternative API failed for ${id}: ${error.message}`);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.CryptoService = CryptoService;
exports.CryptoService = CryptoService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [axios_1.HttpService, Object])
], CryptoService);
//# sourceMappingURL=crypto.service.js.map