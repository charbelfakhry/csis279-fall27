import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction, literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Permission } from '../permissions/permission.model.js';
import { RoleDto } from './dto/role.dto.js';
import { RolePermission } from './role-permission.model.js';
import { Role } from './role.model.js';

// each role comes with its permission codes and how many users have it
const withPermissions = {
  attributes: [
    'id',
    'name',
    'description',
    'isSystem',
    'isDefault',
    [literal('(SELECT count(*)::int FROM user_roles WHERE user_roles.role_id = "Role"."id")'), 'userCount'],
  ] as never,
  include: [{ model: Permission, attributes: ['code'], through: { attributes: [] } }],
  order: [
    ['id', 'ASC'],
    [{ model: Permission, as: 'permissions' }, 'code', 'ASC'],
  ] as never,
};

const toResponse = (role: Role) => {
  const { permissions, ...rest } = role.get({ plain: true });
  return { ...rest, permissions: (permissions as Permission[]).map((permission) => permission.code) };
};

@Injectable()
export class RolesRepository {
  constructor(
    @InjectModel(Role) private readonly roleModel: typeof Role,
    @InjectModel(Permission) private readonly permissionModel: typeof Permission,
    @InjectModel(RolePermission) private readonly rolePermissionModel: typeof RolePermission,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll() {
    const roles = await this.roleModel.findAll(withPermissions);
    return roles.map(toResponse);
  }

  async findById(id: number, transaction?: Transaction) {
    const role = await this.roleModel.findOne({ where: { id }, ...withPermissions, transaction });
    return role ? toResponse(role) : undefined;
  }

  async create(role: RoleDto) {
    return this.sequelize.transaction(async (transaction) => {
      const created = await this.roleModel.create(
        { name: role.name, description: role.description ?? null },
        { transaction },
      );
      if (role.isDefault) await this.makeDefault(created.id, transaction);
      await this.setPermissions(created.id, role.permissions, transaction);
      return this.findById(created.id, transaction);
    });
  }

  async update(id: number, role: RoleDto) {
    return this.sequelize.transaction(async (transaction) => {
      // only one role can be the default, so turn it off on the others first
      if (role.isDefault) await this.clearOtherDefaults(id, transaction);

      const [count] = await this.roleModel.update(
        { name: role.name, description: role.description ?? null, isDefault: role.isDefault ?? false },
        { where: { id }, transaction },
      );
      if (!count) return undefined;

      await this.setPermissions(id, role.permissions, transaction);
      return this.findById(id, transaction);
    });
  }

  async remove(id: number) {
    return (await this.roleModel.destroy({ where: { id } })) > 0;
  }

  private async makeDefault(id: number, transaction: Transaction) {
    await this.clearOtherDefaults(id, transaction);
    await this.roleModel.update({ isDefault: true }, { where: { id }, transaction });
  }

  private async clearOtherDefaults(id: number, transaction: Transaction) {
    await this.roleModel.update(
      { isDefault: false },
      { where: { isDefault: true, id: { [Op.ne]: id } }, transaction },
    );
  }

  // replaces the role's permissions with the given codes
  private async setPermissions(roleId: number, codes: string[], transaction: Transaction) {
    await this.rolePermissionModel.destroy({ where: { roleId }, transaction });
    const permissions = await this.permissionModel.findAll({
      where: { code: { [Op.in]: codes } },
      attributes: ['id'],
      transaction,
    });
    await this.rolePermissionModel.bulkCreate(
      permissions.map((permission) => ({ roleId, permissionId: permission.id })),
      { transaction },
    );
  }
}
