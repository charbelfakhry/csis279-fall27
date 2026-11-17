import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { Permission } from '../permissions/permission.model.js';
import { RolePermission } from './role-permission.model.js';

@Table({ tableName: 'roles', timestamps: false })
export class Role extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  // unique ignoring case (index on lower(name))
  @Column({ type: DataType.TEXT, allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT })
  description: string | null;

  // system roles (admin) can't be edited or deleted, so nobody can lock everyone out
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_system' })
  isSystem: boolean;

  // the role given to newly registered accounts; at most one role has it
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' })
  isDefault: boolean;

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];
}
