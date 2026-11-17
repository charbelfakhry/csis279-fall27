import { Column, DataType, Model, Table } from 'sequelize-typescript';

// permission codes are "<resource>:<action>" and are checked by @RequirePermissions(),
// so new ones are added with api/sql/rbac.sql together with the code that uses them
@Table({ tableName: 'permissions', timestamps: false })
export class Permission extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false, unique: true })
  code: string;

  @Column({ type: DataType.TEXT })
  description: string | null;
}
