export declare class Coin {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
    image: string;
    market_cap_rank: number;
    last_updated: string;
}
export declare class CoinResponse {
    coins: Coin[];
    page: number;
    perPage: number;
    total: number;
    hasNextPage: boolean;
}
