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
exports.CryptoController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const crypto_service_1 = require("./crypto.service");
const get_coins_dto_1 = require("./dto/get-coins.dto");
const search_coins_dto_1 = require("./dto/search-coins.dto");
let CryptoController = class CryptoController {
    cryptoService;
    constructor(cryptoService) {
        this.cryptoService = cryptoService;
    }
    async getCoins(getCoinsDto) {
        return this.cryptoService.getCoins(getCoinsDto);
    }
    async getCoinById(id, currency = 'usd') {
        return this.cryptoService.getCoinById(id, currency);
    }
    async getCoinChart(id, currency = 'usd', days = '1') {
        return this.cryptoService.getChartData(id, currency, parseInt(days));
    }
    async searchCoins(searchCoinsDto) {
        return this.cryptoService.searchCoins(searchCoinsDto.query);
    }
    async getWatchlistCoins(ids, currency = 'usd') {
        const idArray = ids.split(',').filter(id => id.trim());
        const coins = await this.cryptoService.getWatchlistCoins(idArray, currency);
        return { coins };
    }
};
exports.CryptoController = CryptoController;
__decorate([
    (0, common_1.Get)('coins'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_coins_dto_1.GetCoinsDto]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "getCoins", null);
__decorate([
    (0, common_1.Get)('coins/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "getCoinById", null);
__decorate([
    (0, common_1.Get)('chart/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('currency')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "getCoinChart", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_coins_dto_1.SearchCoinsDto]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "searchCoins", null);
__decorate([
    (0, common_1.Get)('watchlist'),
    __param(0, (0, common_1.Query)('ids')),
    __param(1, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CryptoController.prototype, "getWatchlistCoins", null);
exports.CryptoController = CryptoController = __decorate([
    (0, common_1.Controller)('crypto'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    __metadata("design:paramtypes", [crypto_service_1.CryptoService])
], CryptoController);
//# sourceMappingURL=crypto.controller.js.map