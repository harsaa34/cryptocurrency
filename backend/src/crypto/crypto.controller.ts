import { Controller, Get, Query, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CryptoService } from './crypto.service';
import { GetCoinsDto } from './dto/get-coins.dto';
import { SearchCoinsDto } from './dto/search-coins.dto';
import { CoinResponse } from './entities/coin.entity';
import { SearchResponse } from './entities/search-result.entity';
import { Coin } from './entities/coin.entity';

@Controller('crypto')
@UseInterceptors(CacheInterceptor)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('coins')
  async getCoins(@Query() getCoinsDto: GetCoinsDto): Promise<CoinResponse> {
    return this.cryptoService.getCoins(getCoinsDto);
  }

  @Get('coins/:id')
  async getCoinById(
    @Param('id') id: string,
    @Query('currency') currency: string = 'usd',
  ): Promise<Coin> {
    return this.cryptoService.getCoinById(id, currency);
  }

  @Get('chart/:id')
  async getCoinChart(
    @Param('id') id: string,
    @Query('currency') currency: string = 'usd',
    @Query('days') days: string = '1',
  ): Promise<any> {
    return this.cryptoService.getChartData(id, currency, parseInt(days));
  }

  @Get('search')
  async searchCoins(@Query() searchCoinsDto: SearchCoinsDto): Promise<SearchResponse> {
    return this.cryptoService.searchCoins(searchCoinsDto.query);
  }

  @Get('watchlist')
  async getWatchlistCoins(@Query('ids') ids: string, @Query('currency') currency: string = 'usd') {
    const idArray = ids.split(',').filter(id => id.trim());
    const coins = await this.cryptoService.getWatchlistCoins(idArray, currency);
    return { coins };
  }
}