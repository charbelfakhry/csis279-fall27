import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthenticatedRequest } from '../../common/authenticated-request.js';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { UserRolesDto } from '../dto/user-roles.dto.js';
import { UserDto } from '../dto/user.dto.js';
import { UsersService } from '../users.service.js';
import { UserType } from './user.type.js';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserType])
  @RequirePermissions('users:read')
  users() {
    return this.usersService.findAll();
  }

  @Query(() => UserType)
  @RequirePermissions('users:read')
  user(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserType)
  @RequirePermissions('users:create')
  createUser(@Args('input') input: UserDto) {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType)
  @RequirePermissions('users:update')
  updateUser(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: UserDto) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('users:delete')
  async deleteUser(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.usersService.remove(id);
    return true;
  }

  // replaces all of the user's roles
  @Mutation(() => UserType)
  @RequirePermissions('roles:manage')
  updateUserRoles(
    @Args('id', { type: () => Int }, ParseIdPipe) id: number,
    @Args('input') input: UserRolesDto,
    @Context('req') request: AuthenticatedRequest,
  ) {
    return this.usersService.updateRoles(id, input.roleIds, request.userId);
  }
}
