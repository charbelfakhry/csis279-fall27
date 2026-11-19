import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('RoleSummary')
export class RoleSummaryType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;
}

@ObjectType('User')
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => Int, { nullable: true })
  age: number | null;

  @Field()
  createdAt: Date;

  @Field(() => [RoleSummaryType])
  roles: RoleSummaryType[];
}
