import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CategoryType } from '../../categories/graphql/category.type.js';

@ObjectType('Product')
export class ProductType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, { nullable: true })
  categoryId: number | null;

  // not a column: filled in by ProductsResolver.category() only when the query asks for it
  @Field(() => CategoryType, { nullable: true })
  category?: CategoryType | null;

  @Field()
  createdAt: Date;
}
