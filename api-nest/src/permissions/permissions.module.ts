import { Module } from '@nestjs/common';
import { PermissionsResolver } from './graphql/permissions.resolver.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserRole } from '../roles/user-role.model.js';
import { Permission } from './permission.model.js';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsGuard } from './permissions.guard.js';
import { PermissionsRepository } from './permissions.repository.js';

@Module({
  imports: [SequelizeModule.forFeature([Permission, UserRole])],
  controllers: [PermissionsController],
  providers: [PermissionsRepository, PermissionsGuard, PermissionsResolver],
  exports: [PermissionsRepository, PermissionsGuard],
})
export class PermissionsModule {}
