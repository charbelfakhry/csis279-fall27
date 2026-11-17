import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from '../users/user.model.js';
import { Role } from './role.model.js';

// join table: a user has many roles. deleting a user removes their rows (ON DELETE CASCADE),
// but a role that is still assigned can't be deleted (no cascade)
@Table({ tableName: 'user_roles', timestamps: false })
export class UserRole extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, primaryKey: true, field: 'user_id' })
  userId: number;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, primaryKey: true, field: 'role_id' })
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;
}
