import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from '../../users/graphql/user.type.js';

// the logged-in user, with the permission codes the frontend uses to hide what they can't do
@ObjectType('SessionUser')
export class SessionUserType extends UserType {
  @Field(() => [String])
  permissions: string[];
}

@ObjectType('AuthPayload')
export class AuthPayloadType {
  @Field()
  token: string;

  @Field(() => SessionUserType)
  user: SessionUserType;
}
