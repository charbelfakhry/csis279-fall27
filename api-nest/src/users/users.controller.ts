import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/authenticated-request.js';
import { ParseIdPipe } from '../common/parse-id.pipe.js';
import { RequirePermissions } from '../permissions/require-permissions.decorator.js';
import { UserRolesDto } from './dto/user-roles.dto.js';
import { UserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('users:create')
  create(@Body() user: UserDto) {
    return this.usersService.create(user);
  }

  @Put(':id')
  @RequirePermissions('users:update')
  update(@Param('id', ParseIdPipe) id: number, @Body() user: UserDto) {
    return this.usersService.update(id, user);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id/roles')
  @RequirePermissions('roles:manage')
  updateRoles(
    @Param('id', ParseIdPipe) id: number,
    @Body() body: UserRolesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.updateRoles(id, body.roleIds, request.userId);
  }
}
