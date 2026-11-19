import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { SupplierDto } from '../dto/supplier.dto.js';
import { SuppliersService } from '../suppliers.service.js';
import { SupplierType } from './supplier.type.js';

@Resolver(() => SupplierType)
export class SuppliersResolver {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Query(() => [SupplierType])
  @RequirePermissions('suppliers:read')
  suppliers() {
    return this.suppliersService.findAll();
  }

  @Query(() => SupplierType)
  @RequirePermissions('suppliers:read')
  supplier(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Mutation(() => SupplierType)
  @RequirePermissions('suppliers:create')
  createSupplier(@Args('input') input: SupplierDto) {
    return this.suppliersService.create(input);
  }

  @Mutation(() => SupplierType)
  @RequirePermissions('suppliers:update')
  updateSupplier(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: SupplierDto) {
    return this.suppliersService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('suppliers:delete')
  async deleteSupplier(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.suppliersService.remove(id);
    return true;
  }
}
