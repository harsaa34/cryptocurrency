"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinResponse = exports.Coin = void 0;
class Coin {
    id;
    name;
    symbol;
    current_price;
    price_change_percentage_24h;
    market_cap;
    total_volume;
    image;
    market_cap_rank;
    last_updated;
}
exports.Coin = Coin;
class CoinResponse {
    coins;
    page;
    perPage;
    total;
    hasNextPage;
}
exports.CoinResponse = CoinResponse;
//# sourceMappingURL=coin.entity.js.map