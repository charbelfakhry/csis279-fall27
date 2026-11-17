import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from '../categories/category.model.js';
import { Order } from '../orders/order.model.js';
import { Permission } from '../permissions/permission.model.js';
import { Product } from '../products/product.model.js';
import { RolePermission } from '../roles/role-permission.model.js';
import { Role } from '../roles/role.model.js';
import { UserRole } from '../roles/user-role.model.js';
import { Supplier } from '../suppliers/supplier.model.js';
import { User } from '../users/user.model.js';

// every model is registered here so associations between modules resolve.
// each feature module still uses SequelizeModule.forFeature() for the models it injects
export const models = [User, Role, UserRole, Permission, RolePermission, Product, Category, Supplier, Order];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT') ?? 5432),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        models,
        // the tables already exist (api/sql/*.sql); never let sequelize change them
        synchronize: false,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
