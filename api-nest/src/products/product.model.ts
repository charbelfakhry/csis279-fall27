import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Category } from '../categories/category.model.js';
import { toFloat } from '../common/decimal.js';

@Table({ tableName: 'products', timestamps: false })
export class Product extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT })
  description: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    get(this: Product) {
      return toFloat(this.getDataValue('price'));
    },
  })
  price: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  quantity: number;

  // ON DELETE SET NULL: deleting a category keeps its products
  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, field: 'category_id' })
  categoryId: number | null;

  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;
}
