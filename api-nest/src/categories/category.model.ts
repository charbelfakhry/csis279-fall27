import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'categories', timestamps: false })
export class Category extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false, unique: true })
  name: string;

  @Column({ type: DataType.TEXT })
  description: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' })
  isActive: boolean;

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;
}
