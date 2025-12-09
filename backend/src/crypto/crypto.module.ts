import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CryptoController],
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}