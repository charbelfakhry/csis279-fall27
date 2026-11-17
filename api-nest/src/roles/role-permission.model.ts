import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Permission } from '../permissions/permission.model.js';
import { Role } from './role.model.js';

// join table: a role has many permissions
@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, primaryKey: true, field: 'role_id' })
  roleId: number;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.INTEGER, primaryKey: true, field: 'permission_id' })
  permissionId: number;
}
