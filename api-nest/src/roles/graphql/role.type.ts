import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Role')
export class RoleType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  // built-in roles (admin) can't be edited or deleted
  @Field()
  isSystem: boolean;

  // given to newly registered accounts
  @Field()
  isDefault: boolean;

  @Field(() => [String])
  permissions: string[];

  @Field(() => Int)
  userCount: number;
}
