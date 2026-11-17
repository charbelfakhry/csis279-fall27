import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { PermissionsRepository } from '../permissions/permissions.repository.js';
import { RoleDto } from './dto/role.dto.js';
import { RolesRepository } from './roles.repository.js';

// role names are unique ignoring case
const toConflict = (error: unknown) =>
  error instanceof UniqueConstraintError ? new ConflictException('A role with this name already exists') : error;

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  findAll() {
    return this.rolesRepository.findAll();
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(role: RoleDto) {
    await this.checkPermissionCodes(role.permissions);
    try {
      return await this.rolesRepository.create(role);
    } catch (error) {
      throw toConflict(error);
    }
  }

  async update(id: number, role: RoleDto) {
    await this.getEditableRole(id);
    await this.checkPermissionCodes(role.permissions);

    let updated;
    try {
      updated = await this.rolesRepository.update(id, role);
    } catch (error) {
      throw toConflict(error);
    }
    if (!updated) throw new NotFoundException('Role not found');
    return updated;
  }

  async remove(id: number) {
    await this.getEditableRole(id);

    let deleted;
    try {
      deleted = await this.rolesRepository.remove(id);
    } catch (error) {
      // user_roles has no cascade, so a role in use can't be deleted
      if (error instanceof ForeignKeyConstraintError) {
        throw new ConflictException('Role is assigned to users and cannot be deleted');
      }
      throw error;
    }
    if (!deleted) throw new NotFoundException('Role not found');
  }

  // permissions are defined by the code, so a role can only use codes that exist in the table
  private async checkPermissionCodes(codes: string[]) {
    const known = new Set((await this.permissionsRepository.findAll()).map((permission) => permission.code));
    const unknown = codes.filter((code) => !known.has(code));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown permissions: ${unknown.join(', ')}`);
    }
  }

  // system roles (admin) are protected so nobody can remove the last way to manage roles
  private async getEditableRole(id: number) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new ConflictException(`The ${role.name} role is built in and can't be changed`);
    }
    return role;
  }
}
