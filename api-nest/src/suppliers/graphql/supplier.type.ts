import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Supplier')
export class SupplierType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field()
  createdAt: Date;
}
