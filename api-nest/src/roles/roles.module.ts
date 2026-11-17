import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from '../permissions/permission.model.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { RolePermission } from './role-permission.model.js';
import { Role } from './role.model.js';
import { RolesController } from './roles.controller.js';
import { RolesRepository } from './roles.repository.js';
import { RolesService } from './roles.service.js';

@Module({
  imports: [SequelizeModule.forFeature([Role, Permission, RolePermission]), PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
})
export class RolesModule {}
