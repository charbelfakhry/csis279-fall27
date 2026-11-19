import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Permission')
export class PermissionType {
  @Field(() => Int)
  id: number;

  // "<resource>:<action>", e.g. "products:delete"
  @Field()
  code: string;

  @Field(() => String, { nullable: true })
  description: string | null;
}
