import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { ProductDto } from './dto/product.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('products:read')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('products:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post() // POST replies 201 by default
  @RequirePermissions('products:create')
  create(@Body() product: ProductDto) {
    return this.productsService.create(product);
  }

  @Put(':id')
  @RequirePermissions('products:update')
  update(@Param('id', ParseIdPipe) id: number, @Body() product: ProductDto) {
    return this.productsService.update(id, product);
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.productsService.remove(id);
  }
}
