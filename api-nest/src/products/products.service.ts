import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForeignKeyConstraintError } from 'sequelize';
import { ProductDto } from './dto/product.dto.js';
import { ProductsRepository } from './products.repository.js';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  findAll() {
    return this.productsRepository.findAll();
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  create(product: ProductDto) {
    return this.productsRepository.create(product);
  }

  async update(id: number, product: ProductDto) {
    const updated = await this.productsRepository.update(id, product);
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async remove(id: number) {
    let deleted;
    try {
      deleted = await this.productsRepository.remove(id);
    } catch (error) {
      // orders reference the product without a cascade
      if (error instanceof ForeignKeyConstraintError) {
        throw new ConflictException('Product has orders and cannot be deleted');
      }
      throw error;
    }
    if (!deleted) throw new NotFoundException('Product not found');
  }
}
