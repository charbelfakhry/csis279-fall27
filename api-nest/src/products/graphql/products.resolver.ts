import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CategoriesLoader } from '../../categories/graphql/categories.loader.js';
import { CategoryType } from '../../categories/graphql/category.type.js';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { ProductDto } from '../dto/product.dto.js';
import { ProductsService } from '../products.service.js';
import { ProductType } from './product.type.js';

@Resolver(() => ProductType)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesLoader: CategoriesLoader,
  ) {}

  @Query(() => [ProductType])
  @RequirePermissions('products:read')
  products() {
    return this.productsService.findAll();
  }

  @Query(() => ProductType)
  @RequirePermissions('products:read')
  product(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Mutation(() => ProductType)
  @RequirePermissions('products:create')
  createProduct(@Args('input') input: ProductDto) {
    return this.productsService.create(input);
  }

  @Mutation(() => ProductType)
  @RequirePermissions('products:update')
  updateProduct(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: ProductDto) {
    return this.productsService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('products:delete')
  async deleteProduct(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.productsService.remove(id);
    return true;
  }

  // only runs when a query selects `category`; the loader batches all of them into one SELECT
  @ResolveField(() => CategoryType, { nullable: true })
  @RequirePermissions('categories:read')
  category(@Parent() product: ProductType) {
    return product.categoryId ? this.categoriesLoader.load(product.categoryId) : null;
  }
}
