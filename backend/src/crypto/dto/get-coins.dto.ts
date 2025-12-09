import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetCoinsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  perPage?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['usd', 'eur', 'gbp', 'jpy'])
  currency?: string = 'usd';

  @IsOptional()
  @IsString()
  query?: string;
}