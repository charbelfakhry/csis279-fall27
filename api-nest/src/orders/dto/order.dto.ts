import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { toCents, toNumber } from '../../common/transforms.js';

const MAX_PRICE = 99999999.99; // same limit as products.price
const MAX_QUANTITY = 2147483647; // integer
const QUANTITY_MESSAGE = `Quantity must be a whole number between 1 and ${MAX_QUANTITY}`;
const PRICE_MESSAGE = `Unit price must be a number between 0 and ${MAX_PRICE}`;

@InputType('OrderInput')
export class OrderDto {
  @Field(() => Int)
  @Transform(toNumber)
  @IsInt({ message: 'Product is required' })
  @Min(1, { message: 'Product is required' })
  productId: number;

  @Field(() => Int)
  @Transform(toNumber)
  @IsInt({ message: QUANTITY_MESSAGE })
  @Min(1, { message: QUANTITY_MESSAGE })
  @Max(MAX_QUANTITY, { message: QUANTITY_MESSAGE })
  quantity: number;

  // optional: when missing, the product's current price is used
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Transform(toCents)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: PRICE_MESSAGE })
  @Min(0, { message: PRICE_MESSAGE })
  @Max(MAX_PRICE, { message: PRICE_MESSAGE })
  unitPrice?: number | null;
}
