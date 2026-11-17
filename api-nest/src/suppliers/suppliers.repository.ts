import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SupplierDto } from './dto/supplier.dto.js';
import { Supplier } from './supplier.model.js';

const toSupplierRow = (supplier: SupplierDto) => ({
  name: supplier.name,
  email: supplier.email,
  phone: supplier.phone ?? null,
});

@Injectable()
export class SuppliersRepository {
  constructor(@InjectModel(Supplier) private readonly supplierModel: typeof Supplier) {}

  async findAll() {
    const suppliers = await this.supplierModel.findAll({ order: [['id', 'ASC']] });
    return suppliers.map((supplier) => supplier.toJSON());
  }

  async findById(id: number) {
    return (await this.supplierModel.findByPk(id))?.toJSON();
  }

  async create(supplier: SupplierDto) {
    return (await this.supplierModel.create(toSupplierRow(supplier))).toJSON();
  }

  async update(id: number, supplier: SupplierDto) {
    const [count, rows] = await this.supplierModel.update(toSupplierRow(supplier), {
      where: { id },
      returning: true,
    });
    return count ? rows[0].toJSON() : undefined;
  }

  async remove(id: number) {
    return (await this.supplierModel.destroy({ where: { id } })) > 0;
  }
}
