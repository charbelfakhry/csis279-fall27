import { Controller, Get } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository.js';
import { RequirePermissions } from './require-permissions.decorator.js';

// read-only: permissions are added with api/sql/rbac.sql, together with the code that checks them
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  @Get()
  @RequirePermissions('roles:read')
  findAll() {
    return this.permissionsRepository.findAll();
  }
}
