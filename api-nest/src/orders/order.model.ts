import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { toFloat } from '../common/decimal.js';
import { Product } from '../products/product.model.js';

@Table({ tableName: 'orders', timestamps: false })
export class Order extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, field: 'order_id' })
  id: number;

  // a product with orders can't be deleted (foreign key without cascade)
  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'product_id' })
  productId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  // the price at the time of the order, so it doesn't change when the product's price does
  @Column({
    type: DataType.DECIMAL,
    field: 'unit_price',
    get(this: Order) {
      return toFloat(this.getDataValue('unitPrice'));
    },
  })
  unitPrice: number | null;

  @BelongsTo(() => Product)
  product: Product;
}
