import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { RoleDto } from './dto/role.dto.js';
import { RolesService } from './roles.service.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('roles:manage')
  create(@Body() role: RoleDto) {
    return this.rolesService.create(role);
  }

  @Put(':id')
  @RequirePermissions('roles:manage')
  update(@Param('id', ParseIdPipe) id: number, @Body() role: RoleDto) {
    return this.rolesService.update(id, role);
  }

  @Delete(':id')
  @RequirePermissions('roles:manage')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
