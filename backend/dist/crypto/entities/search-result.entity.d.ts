export declare class SearchResult {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
}
export declare class SearchResponse {
    coins: SearchResult[];
    query: string;
    timestamp: string;
}
