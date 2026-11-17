import { BelongsToMany, Column, DataType, DefaultScope, Model, Scopes, Table } from 'sequelize-typescript';
import { Role } from '../roles/role.model.js';
import { UserRole } from '../roles/user-role.model.js';

// the password hash is left out of every query unless the 'withPassword' scope is used
@DefaultScope(() => ({ attributes: { exclude: ['passwordHash'] } }))
@Scopes(() => ({ withPassword: { attributes: { include: ['passwordHash'] } } }))
@Table({ tableName: 'users', timestamps: false })
export class User extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false, field: 'first_name' })
  firstName: string;

  @Column({ type: DataType.TEXT, allowNull: false, field: 'last_name' })
  lastName: string;

  // unique ignoring case (index on lower(email))
  @Column({ type: DataType.TEXT, allowNull: false })
  email: string;

  @Column({ type: DataType.INTEGER })
  age: number | null;

  // null for users created from the Users page: they can't log in until they register
  @Column({ type: DataType.TEXT, field: 'password_hash' })
  passwordHash: string | null;

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];
}
