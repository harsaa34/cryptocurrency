import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100,
    }]),
    CacheModule.register({
      ttl: 300000, // 5 minutes cache
      max: 100,
      isGlobal: true,
    }),
    CryptoModule,
  ],
})
export class AppModule {}