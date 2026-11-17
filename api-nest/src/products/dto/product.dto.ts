import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { toNumber, trim, trimToNull } from '../../common/transforms.js';

const MAX_PRICE = 99999999.99; // numeric(10, 2)
const MAX_QUANTITY = 2147483647; // integer
const PRICE_MESSAGE = `Price must be a number between 0 and ${MAX_PRICE}`;
const QUANTITY_MESSAGE = `Quantity must be a whole number between 0 and ${MAX_QUANTITY}`;

export class ProductDto {
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Description must be text' })
  description?: string | null;

  @Transform(toNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: PRICE_MESSAGE })
  @Min(0, { message: PRICE_MESSAGE })
  @Max(MAX_PRICE, { message: PRICE_MESSAGE })
  price: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: QUANTITY_MESSAGE })
  @Min(0, { message: QUANTITY_MESSAGE })
  @Max(MAX_QUANTITY, { message: QUANTITY_MESSAGE })
  quantity?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt({ message: 'Category must be a valid category id' })
  @Min(1, { message: 'Category must be a valid category id' })
  categoryId?: number | null;
}
