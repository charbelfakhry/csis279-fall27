import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { AuthGuard } from './auth/auth.guard.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { formatGraphqlError } from './common/format-graphql-error.js';
import { SequelizeExceptionFilter } from './common/sequelize-exception.filter.js';
import { DatabaseModule } from './database/database.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PermissionsGuard } from './permissions/permissions.guard.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { ProductsModule } from './products/products.module.js';
import { RolesModule } from './roles/roles.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // code first: the schema is generated from the @ObjectType/@InputType classes
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // served at /api/graphql, next to the REST routes
      useGlobalPrefix: true,
      // the request goes into the GraphQL context so AuthGuard can read its token
      context: ({ req }: { req: unknown }) => ({ req }),
      // also run the guards on @ResolveField methods (e.g. Product.category needs categories:read)
      fieldResolverEnhancers: ['guards'],
      formatError: formatGraphqlError,
    }),
    AuthModule,
    PermissionsModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    CategoriesModule,
    SuppliersModule,
    OrdersModule,
  ],
  providers: [
    // global guards run in this order: who are you (401), then are you allowed (403)
    { provide: APP_GUARD, useExisting: AuthGuard },
    { provide: APP_GUARD, useExisting: PermissionsGuard },
    { provide: APP_FILTER, useClass: SequelizeExceptionFilter },
  ],
})
export class AppModule {}
