import { Query, Resolver } from '@nestjs/graphql';
import { PermissionsRepository } from '../permissions.repository.js';
import { RequirePermissions } from '../require-permissions.decorator.js';
import { PermissionType } from './permission.type.js';

// read-only: permissions are added with api/sql/rbac.sql, together with the code that checks them
@Resolver(() => PermissionType)
export class PermissionsResolver {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  @Query(() => [PermissionType])
  @RequirePermissions('roles:read')
  permissions() {
    return this.permissionsRepository.findAll();
  }
}
