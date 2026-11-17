import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { CategoriesService } from './categories.service.js';
import { CategoryDto } from './dto/category.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions('categories:read')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('categories:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @RequirePermissions('categories:create')
  create(@Body() category: CategoryDto) {
    return this.categoriesService.create(category);
  }

  @Put(':id')
  @RequirePermissions('categories:update')
  update(@Param('id', ParseIdPipe) id: number, @Body() category: CategoryDto) {
    return this.categoriesService.update(id, category);
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
