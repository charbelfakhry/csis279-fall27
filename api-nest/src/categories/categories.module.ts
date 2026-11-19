import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './categories.controller.js';
import { CategoriesRepository } from './categories.repository.js';
import { CategoriesService } from './categories.service.js';
import { Category } from './category.model.js';
import { CategoriesLoader } from './graphql/categories.loader.js';
import { CategoriesResolver } from './graphql/categories.resolver.js';

@Module({
  imports: [SequelizeModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, CategoriesResolver, CategoriesLoader],
  exports: [CategoriesLoader],
})
export class CategoriesModule {}
