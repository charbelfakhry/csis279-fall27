import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductDto } from './dto/product.dto.js';
import { Product } from './product.model.js';

const attributes = ['id', 'name', 'description', 'price', 'quantity', 'categoryId', 'createdAt'];

const toProductRow = (product: ProductDto) => ({
  name: product.name,
  description: product.description ?? null,
  price: product.price,
  quantity: product.quantity ?? 0,
  categoryId: product.categoryId ?? null,
});

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel(Product) private readonly productModel: typeof Product) {}

  async findAll() {
    const products = await this.productModel.findAll({ attributes, order: [['id', 'ASC']] });
    return products.map((product) => product.toJSON());
  }

  async findById(id: number) {
    const product = await this.productModel.findByPk(id, { attributes });
    return product?.toJSON();
  }

  async create(product: ProductDto) {
    const created = await this.productModel.create(toProductRow(product));
    return this.findById(created.id);
  }

  async update(id: number, product: ProductDto) {
    const [count] = await this.productModel.update(toProductRow(product), { where: { id } });
    return count ? this.findById(id) : undefined;
  }

  async remove(id: number) {
    return (await this.productModel.destroy({ where: { id } })) > 0;
  }
}
