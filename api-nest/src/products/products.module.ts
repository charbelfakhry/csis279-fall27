import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsResolver } from './graphql/products.resolver.js';
import { Product } from './product.model.js';
import { ProductsController } from './products.controller.js';
import { ProductsRepository } from './products.repository.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [SequelizeModule.forFeature([Product]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsResolver],
  exports: [ProductsRepository],
})
export class ProductsModule {}
