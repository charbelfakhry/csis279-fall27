import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { CategoriesService } from '../categories.service.js';
import { CategoryDto } from '../dto/category.dto.js';
import { CategoryType } from './category.type.js';

@Resolver(() => CategoryType)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [CategoryType])
  @RequirePermissions('categories:read')
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => CategoryType)
  @RequirePermissions('categories:read')
  category(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => CategoryType)
  @RequirePermissions('categories:create')
  createCategory(@Args('input') input: CategoryDto) {
    return this.categoriesService.create(input);
  }

  @Mutation(() => CategoryType)
  @RequirePermissions('categories:update')
  updateCategory(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: CategoryDto) {
    return this.categoriesService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('categories:delete')
  async deleteCategory(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.categoriesService.remove(id);
    return true;
  }
}
