import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderDto } from './dto/order.dto.js';
import { OrdersRepository } from './orders.repository.js';

const productNotFound = () => new BadRequestException('Product does not exist');

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  findAll() {
    return this.ordersRepository.findAll();
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(order: OrderDto) {
    const created = await this.ordersRepository.create(order);
    if (created === 'no-product' || !created) throw productNotFound();
    return created;
  }

  async update(id: number, order: OrderDto) {
    const updated = await this.ordersRepository.update(id, order);
    if (updated === 'no-product') throw productNotFound();
    if (!updated) throw new NotFoundException('Order not found');
    return updated;
  }

  async remove(id: number) {
    if (!(await this.ordersRepository.remove(id))) throw new NotFoundException('Order not found');
  }
}
