import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Order')
export class OrderType {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  productId: number;

  @Field()
  productName: string;

  @Field(() => Int)
  quantity: number;

  // the price when the order was placed; null only for old rows
  @Field(() => Float, { nullable: true })
  unitPrice: number | null;
}
