import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { RoleDto } from '../dto/role.dto.js';
import { RolesService } from '../roles.service.js';
import { RoleType } from './role.type.js';

@Resolver(() => RoleType)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Query(() => [RoleType])
  @RequirePermissions('roles:read')
  roles() {
    return this.rolesService.findAll();
  }

  @Query(() => RoleType)
  @RequirePermissions('roles:read')
  role(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Mutation(() => RoleType)
  @RequirePermissions('roles:manage')
  createRole(@Args('input') input: RoleDto) {
    return this.rolesService.create(input);
  }

  @Mutation(() => RoleType)
  @RequirePermissions('roles:manage')
  updateRole(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: RoleDto) {
    return this.rolesService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('roles:manage')
  async deleteRole(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.rolesService.remove(id);
    return true;
  }
}
