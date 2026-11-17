import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { OrderDto } from './dto/order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermissions('orders:read')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('orders:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @RequirePermissions('orders:create')
  create(@Body() order: OrderDto) {
    return this.ordersService.create(order);
  }

  @Put(':id')
  @RequirePermissions('orders:update')
  update(@Param('id', ParseIdPipe) id: number, @Body() order: OrderDto) {
    return this.ordersService.update(id, order);
  }

  @Delete(':id')
  @RequirePermissions('orders:delete')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
