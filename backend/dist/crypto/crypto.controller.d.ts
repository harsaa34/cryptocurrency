import { CryptoService } from './crypto.service';
import { GetCoinsDto } from './dto/get-coins.dto';
import { SearchCoinsDto } from './dto/search-coins.dto';
import { CoinResponse } from './entities/coin.entity';
import { SearchResponse } from './entities/search-result.entity';
import { Coin } from './entities/coin.entity';
export declare class CryptoController {
    private readonly cryptoService;
    constructor(cryptoService: CryptoService);
    getCoins(getCoinsDto: GetCoinsDto): Promise<CoinResponse>;
    getCoinById(id: string, currency?: string): Promise<Coin>;
    getCoinChart(id: string, currency?: string, days?: string): Promise<any>;
    searchCoins(searchCoinsDto: SearchCoinsDto): Promise<SearchResponse>;
    getWatchlistCoins(ids: string, currency?: string): Promise<{
        coins: Coin[];
    }>;
}
