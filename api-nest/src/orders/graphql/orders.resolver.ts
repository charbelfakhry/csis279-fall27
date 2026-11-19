import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { OrderDto } from '../dto/order.dto.js';
import { OrdersService } from '../orders.service.js';
import { OrderType } from './order.type.js';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderType])
  @RequirePermissions('orders:read')
  orders() {
    return this.ordersService.findAll();
  }

  @Query(() => OrderType)
  @RequirePermissions('orders:read')
  order(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Mutation(() => OrderType)
  @RequirePermissions('orders:create')
  createOrder(@Args('input') input: OrderDto) {
    return this.ordersService.create(input);
  }

  @Mutation(() => OrderType)
  @RequirePermissions('orders:update')
  updateOrder(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: OrderDto) {
    return this.ordersService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('orders:delete')
  async deleteOrder(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.ordersService.remove(id);
    return true;
  }
}
