import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsInt, Min } from 'class-validator';

const MESSAGE = 'roleIds must be a list of role ids';

@InputType('UserRolesInput')
export class UserRolesDto {
  @Field(() => [Int])
  @IsArray({ message: MESSAGE })
  @IsInt({ each: true, message: MESSAGE })
  @Min(1, { each: true, message: MESSAGE })
  roleIds: number[];
}
