import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { SupplierDto } from './dto/supplier.dto.js';
import { SuppliersService } from './suppliers.service.js';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @RequirePermissions('suppliers:read')
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('suppliers:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @RequirePermissions('suppliers:create')
  create(@Body() supplier: SupplierDto) {
    return this.suppliersService.create(supplier);
  }

  @Put(':id')
  @RequirePermissions('suppliers:update')
  update(@Param('id', ParseIdPipe) id: number, @Body() supplier: SupplierDto) {
    return this.suppliersService.update(id, supplier);
  }

  @Delete(':id')
  @RequirePermissions('suppliers:delete')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
