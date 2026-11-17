import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../roles/role.model.js';
import { UserRole } from '../roles/user-role.model.js';
import { Permission } from './permission.model.js';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectModel(Permission) private readonly permissionModel: typeof Permission,
    @InjectModel(UserRole) private readonly userRoleModel: typeof UserRole,
  ) {}

  async findAll() {
    const permissions = await this.permissionModel.findAll({
      attributes: ['id', 'code', 'description'],
      order: [['code', 'ASC']],
    });
    return permissions.map((permission) => permission.get({ plain: true }));
  }

  // every permission the user gets from any of their roles, as a sorted list of codes
  async findCodesByUserId(userId: number): Promise<string[]> {
    const userRoles = await this.userRoleModel.findAll({
      where: { userId },
      attributes: ['roleId'],
      include: [
        {
          model: Role,
          attributes: ['id'],
          include: [{ model: Permission, attributes: ['code'], through: { attributes: [] } }],
        },
      ],
    });
    const codes = new Set(userRoles.flatMap((userRole) => userRole.role.permissions.map((p) => p.code)));
    return [...codes].sort();
  }
}
