import { Module } from '@nestjs/common';
import { SuppliersResolver } from './graphql/suppliers.resolver.js';
import { SequelizeModule } from '@nestjs/sequelize';
import { Supplier } from './supplier.model.js';
import { SuppliersController } from './suppliers.controller.js';
import { SuppliersRepository } from './suppliers.repository.js';
import { SuppliersService } from './suppliers.service.js';

@Module({
  imports: [SequelizeModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersRepository, SuppliersResolver],
})
export class SuppliersModule {}
