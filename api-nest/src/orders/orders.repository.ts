import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Product } from '../products/product.model.js';
import { OrderDto } from './dto/order.dto.js';
import { Order } from './order.model.js';

const withProduct = {
  attributes: ['id', 'productId', 'quantity', 'unitPrice'],
  include: [{ model: Product, attributes: ['name'] }],
};

// flattens the joined product into productName, like the list page shows it
const toResponse = (order: Order) => {
  const { product, ...rest } = order.toJSON();
  return { ...rest, productName: product.name };
};

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(Product) private readonly productModel: typeof Product,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll() {
    const orders = await this.orderModel.findAll({ ...withProduct, order: [['id', 'ASC']] });
    return orders.map(toResponse);
  }

  async findById(id: number) {
    const order = await this.orderModel.findByPk(id, withProduct);
    return order ? toResponse(order) : undefined;
  }

  // returns 'no-product' when the product doesn't exist. the product row is locked
  // so it can't be deleted between reading its price and inserting the order
  async create(order: OrderDto) {
    const id = await this.sequelize.transaction(async (transaction) => {
      const product = await this.productModel.findByPk(order.productId, { transaction, lock: true });
      if (!product) return undefined;

      const created = await this.orderModel.create(
        { productId: order.productId, quantity: order.quantity, unitPrice: order.unitPrice ?? product.price },
        { transaction },
      );
      return created.id;
    });
    return id === undefined ? 'no-product' : this.findById(id);
  }

  // like create, plus undefined when the order doesn't exist
  async update(id: number, order: OrderDto) {
    const result = await this.sequelize.transaction(async (transaction) => {
      const product = await this.productModel.findByPk(order.productId, { transaction, lock: true });
      if (!product) return 'no-product' as const;

      const [count] = await this.orderModel.update(
        { productId: order.productId, quantity: order.quantity, unitPrice: order.unitPrice ?? product.price },
        { where: { id }, transaction },
      );
      return count > 0;
    });
    if (result === 'no-product') return result;
    return result ? this.findById(id) : undefined;
  }

  async remove(id: number) {
    return (await this.orderModel.destroy({ where: { id } })) > 0;
  }
}
