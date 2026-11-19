import { Module } from '@nestjs/common';
import { UsersResolver } from './graphql/users.resolver.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../roles/role.model.js';
import { UserRole } from '../roles/user-role.model.js';
import { User } from './user.model.js';
import { UsersController } from './users.controller.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [SequelizeModule.forFeature([User, Role, UserRole])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersResolver],
  exports: [UsersRepository],
})
export class UsersModule {}
