import { HttpService } from '@nestjs/axios';
import { Coin, CoinResponse } from './entities/coin.entity';
import { SearchResponse } from './entities/search-result.entity';
import { GetCoinsDto } from './dto/get-coins.dto';
export declare class CryptoService {
    private readonly httpService;
    private cacheManager;
    private readonly API_BASE;
    private readonly ALTERNATIVE_API;
    private readonly RATE_LIMIT_DELAY;
    constructor(httpService: HttpService, cacheManager: any);
    getCoins(getCoinsDto: GetCoinsDto): Promise<CoinResponse>;
    getCoinById(id: string, currency?: string): Promise<Coin>;
    getChartData(id: string, currency: string, days: number): Promise<any>;
    searchCoins(query: string): Promise<SearchResponse>;
    getWatchlistCoins(ids: string[], currency?: string): Promise<Coin[]>;
    private getCoinsFromAlternativeAPI;
    private getCoinFromAlternativeAPI;
    private delay;
}
