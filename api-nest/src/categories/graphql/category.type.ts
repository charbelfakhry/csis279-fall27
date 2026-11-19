import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
