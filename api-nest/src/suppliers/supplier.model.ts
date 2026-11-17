import { Column, DataType, Model, Table } from 'sequelize-typescript';

// the table is "supplier" with a "supplier_id" key; the API exposes them as suppliers with an id
@Table({ tableName: 'supplier', timestamps: false })
export class Supplier extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, field: 'supplier_id' })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false, unique: true })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  email: string;

  @Column({ type: DataType.TEXT })
  phone: string | null;

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;
}
