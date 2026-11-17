import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import { SupplierDto } from './dto/supplier.dto.js';
import { SuppliersRepository } from './suppliers.repository.js';

// supplier.name is unique, so a duplicate is a 409 instead of a 500
const toConflict = (error: unknown) =>
  error instanceof UniqueConstraintError ? new ConflictException('A supplier with this name already exists') : error;

@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  findAll() {
    return this.suppliersRepository.findAll();
  }

  async findOne(id: number) {
    const supplier = await this.suppliersRepository.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(supplier: SupplierDto) {
    try {
      return await this.suppliersRepository.create(supplier);
    } catch (error) {
      throw toConflict(error);
    }
  }

  async update(id: number, supplier: SupplierDto) {
    let updated;
    try {
      updated = await this.suppliersRepository.update(id, supplier);
    } catch (error) {
      throw toConflict(error);
    }
    if (!updated) throw new NotFoundException('Supplier not found');
    return updated;
  }

  async remove(id: number) {
    let deleted;
    try {
      deleted = await this.suppliersRepository.remove(id);
    } catch (error) {
      // products.supplier_id references the supplier without a cascade
      if (error instanceof ForeignKeyConstraintError) {
        throw new ConflictException('Supplier is still linked to products');
      }
      throw error;
    }
    if (!deleted) throw new NotFoundException('Supplier not found');
  }
}
