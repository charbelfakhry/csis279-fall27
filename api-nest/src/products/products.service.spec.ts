import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ForeignKeyConstraintError } from 'sequelize';
import { ProductsRepository } from './products.repository.js';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  const repo = {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const product = { name: 'Pen', price: 1.5, quantity: 3 };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [ProductsService, { provide: ProductsRepository, useValue: repo }],
    }).compile();
    service = module.get(ProductsService);
  });

  it('returns a product by id', async () => {
    repo.findById.mockResolvedValue({ id: 1, ...product });
    await expect(service.findOne(1)).resolves.toEqual({ id: 1, ...product });
  });

  it('throws 404 when the product does not exist', async () => {
    repo.findById.mockResolvedValue(undefined);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
    repo.update.mockResolvedValue(undefined);
    await expect(service.update(99, product)).rejects.toBeInstanceOf(NotFoundException);
    repo.remove.mockResolvedValue(undefined);
    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws 409 when deleting a product that has orders', async () => {
    const fkError = new ForeignKeyConstraintError({ parent: Object.assign(new Error('fk'), { sql: '' }) });
    repo.remove.mockRejectedValue(fkError);
    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows other errors', async () => {
    repo.remove.mockRejectedValue(new Error('boom'));
    await expect(service.remove(1)).rejects.toThrow('boom');
  });
});
