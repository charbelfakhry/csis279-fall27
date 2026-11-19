# Adding GraphQL to api-nest

**CSIS279 · Tutorial**

You already have a REST API in `api-nest`: NestJS, Sequelize, JWT login and role-based permissions. In this tutorial you add a GraphQL endpoint next to it that reuses the same services, the same validation and the same permission checks, then call it from the React app.

| Builds on | Endpoint | Covers | Time |
| --- | --- | --- | --- |
| api-nest (NestJS 12, Sequelize) | `POST /api/graphql` | categories & products | about 2 hours |

**Contents**

- [0. Why GraphQL?](#0-why-graphql)
- [1. Install the packages](#1-install-the-packages)
- [2. Turn GraphQL on](#2-turn-graphql-on)
- [3. Describe what the API returns](#3-describe-what-the-api-returns)
- [4. Your first queries](#4-your-first-queries)
- [5. Make login and permissions work](#5-make-login-and-permissions-work)
- [6. Mutations: creating and changing data](#6-mutations-creating-and-changing-data)
- [7. Errors](#7-errors)
- [8. Relations: a product's category](#8-relations-a-products-category)
- [9. The N+1 problem and DataLoader](#9-the-n1-problem-and-dataloader)
- [10. Call it from React](#10-call-it-from-react)
- [Exercises](#exercises)
- [Troubleshooting](#troubleshooting)

## 0. Why GraphQL?

Say the Products page should show each product's *category name*. With REST, the frontend asks for `/api/products`, sees only a `categoryId`, then also fetches `/api/categories` and matches them up in JavaScript. It also receives every field of every product, used or not.

With GraphQL there is **one endpoint**, and the client sends a query describing the exact shape it wants. The server answers in that same shape:

*Query*

```graphql
query {
  products {
    name
    price
    category { name }
  }
}
```

*Response*

```json
{
  "data": {
    "products": [
      { "name": "Product 1-2", "price": 100,
        "category": { "name": "iPhone" } }
    ]
  }
}
```

| | REST (what you have) | GraphQL (what you'll add) |
| --- | --- | --- |
| **Endpoints** | One URL per resource: `/products`, `/products/:id`… | One URL: `POST /api/graphql` |
| **Reading** | `GET` requests | A `query` operation |
| **Writing** | `POST` / `PUT` / `DELETE` | A `mutation` operation |
| **Response shape** | Decided by the server | Decided by the query |
| **Contract** | Documented by hand | A typed schema the server publishes |
| **Errors** | HTTP status codes (404, 409…) | Usually HTTP 200, with an `errors` array |

### Words you'll meet

- **Schema**: the list of types and operations the API offers. Clients can read it, and the Sandbox uses it for autocomplete.
- **Object type**: a shape the API returns, like `Product`. Close to a REST response body.
- **Query / Mutation**: the entry points for reading and writing. Close to REST routes.
- **Resolver**: the method that produces a field's value. Close to a controller method.
- **Input type**: the shape of an argument, like a REST request body (your DTOs).

NestJS supports two styles. In *schema first* you write the schema in GraphQL's own language. In **code first**, which this tutorial uses, you write TypeScript classes with decorators and Nest generates the schema. Code first suits this project because it already uses decorated classes for Sequelize models and DTOs.

## 1. Install the packages

From the `api-nest` folder:

*Terminal*

```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server @as-integrations/express5 graphql
```

- `@nestjs/graphql` adds the decorators (`@ObjectType`, `@Query`…) and builds the schema.
- `@nestjs/apollo` and `@apollo/server` run the GraphQL server. Apollo is the most common one.
- `@as-integrations/express5` plugs Apollo into Express 5, which NestJS 12 uses.
- `graphql` is the reference implementation that all of the above build on.

## 2. Turn GraphQL on

Register `GraphQLModule` in `AppModule`, next to `DatabaseModule`:

**`api-nest/src/app.module.ts`**

```ts
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { formatGraphqlError } from './common/format-graphql-error.js';
// ...the existing imports

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // code first: the schema is generated from the @ObjectType/@Field classes
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // served at /api/graphql, next to the REST routes
      useGlobalPrefix: true,
      // the request goes into the GraphQL context so AuthGuard can read its token
      context: ({ req }: { req: unknown }) => ({ req }),
      // also run the guards on @ResolveField methods (step 8)
      fieldResolverEnhancers: ['guards'],
      formatError: formatGraphqlError, // written in step 7
    }),
    AuthModule,
    // ...the other modules, unchanged
  ],
```

> [!NOTE]
> **Why each option**
> - `autoSchemaFile`: Nest writes the generated schema to `src/schema.gql` on every start. Open it to see exactly what clients see, and commit it so schema changes show up in code review.
> - `useGlobalPrefix`: `setup.ts` prefixes every route with `/api`. With this option GraphQL lives at `/api/graphql`, so React can reuse `VITE_API_URL`.
> - `context`: whatever this returns is handed to every resolver and guard. We pass the Express request so `AuthGuard` can read the token (step 5).
> - `fieldResolverEnhancers`: by default, Nest runs guards only on queries and mutations, not on `@ResolveField` methods. Without this line, a permission you put on a field (step 8) is silently ignored.
> - `formatError`: you write this in step 7. Comment the line out until then.

If you start the server now, it fails with *"Query root type must be provided"*. A schema needs at least one query, so add types and a resolver next.

## 3. Describe what the API returns

An `@ObjectType` class is the GraphQL version of a response body. Each `@Field` becomes a field clients can ask for. Put GraphQL files in a `graphql/` folder inside each feature, so REST and GraphQL code stay side by side.

**`api-nest/src/categories/graphql/category.type.ts`** (new file)

```ts
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Category')
export class CategoryType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}
```

**`api-nest/src/products/graphql/product.type.ts`** (new file)

```ts
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CategoryType } from '../../categories/graphql/category.type.js';

@ObjectType('Product')
export class ProductType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, { nullable: true })
  categoryId: number | null;

  // not a column: filled in by ProductsResolver.category() only when the query asks for it
  @Field(() => CategoryType, { nullable: true })
  category?: CategoryType | null;

  @Field()
  createdAt: Date;
}
```

> [!WARNING]
> GraphQL needs every field's type, and Nest reads it from TypeScript when it can. Two cases need you to pass it yourself:
> - **`number`**: GraphQL has `Int` and `Float`, and Nest silently picks `Float`. Nothing breaks, but your ids show up as `id: Float!` in the schema. Write `@Field(() => Int)` for whole numbers.
> - **`string | null`**: TypeScript can't describe a union at runtime, so the server refuses to start with *"Undefined type error. Make sure you are providing an explicit type for the "description" of the "CategoryType" class."* Write `@Field(() => String, { nullable: true })`.

Fields are **required by default**. In the schema, `name: String!` means it is never null. Any column that can be null needs `nullable: true`, or a null value makes the whole query fail.

## 4. Your first queries

A resolver is the GraphQL version of a controller. Compare it with `categories.controller.ts`: the same service, the same permission decorator and the same `ParseIdPipe`. Only the route decorators change.

**`api-nest/src/categories/graphql/categories.resolver.ts`** (new file)

```ts
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { CategoriesService } from '../categories.service.js';
import { CategoryType } from './category.type.js';

@Resolver(() => CategoryType)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [CategoryType])
  @RequirePermissions('categories:read')
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => CategoryType)
  @RequirePermissions('categories:read')
  category(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}
```

Add the resolver to the module's providers. Resolvers are providers, not controllers:

**`api-nest/src/categories/categories.module.ts`**

```ts
import { CategoriesResolver } from './graphql/categories.resolver.js';

@Module({
  imports: [SequelizeModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, CategoriesResolver],
})
export class CategoriesModule {}
```

Do the same for products: create `products/graphql/products.resolver.ts` with `products` and `product(id)` queries (copy the categories one; the full file is in step 9), and add `ProductsResolver` to `ProductsModule`'s providers.

### Try it in the Sandbox

Run `npm run start:dev` and open <http://localhost:3000/api/graphql> in the browser. Apollo's landing page offers to open the **Sandbox**, an editor with autocomplete built from your schema. Run:

*Sandbox · Operation*

```graphql
query {
  categories {
    id
    name
    isActive
  }
}
```

It fails with `INTERNAL_SERVER_ERROR` and the message *"Cannot read properties of undefined (reading 'headers')"*, with or without a token. The global `AuthGuard` already runs for this query, but it looks for the request where REST keeps it and finds nothing. That's the next step.

## 5. Make login and permissions work

The global guards from `app.module.ts` also run before every resolver. Both find the request with `context.switchToHttp().getRequest()`. In a GraphQL call that returns `undefined`, because the request lives in the GraphQL context you set up in step 2, hence the `'headers'` error. Add one helper that knows both places:

**`api-nest/src/common/get-request.ts`** (new file)

```ts
import { ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedRequest } from './authenticated-request.js';

// REST and GraphQL keep the request in different places; guards use this to find it
export function getRequest(context: ExecutionContext): AuthenticatedRequest {
  if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext().req;
  }
  return context.switchToHttp().getRequest();
}
```

Use it in both guards:

*api-nest/src/auth/auth.guard.ts and src/permissions/permissions.guard.ts*

```ts
import { getRequest } from '../common/get-request.js';

// before
const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
// after
const request = getRequest(context);
```

The guard's unit test builds a fake context. Give it the method the helper now calls:

**`api-nest/src/permissions/permissions.guard.spec.ts`**

```ts
const contextFor = (request: object) =>
  ({
    getType: () => 'http', // new: getRequest() checks this first
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;
```

### Send your token from the Sandbox

Log in to the React app, open DevTools → **Application** → **Local Storage** and copy the value of `token`. Or get a token from the terminal:

*Terminal*

```bash
curl -s http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-password"}'
# copy the "token" value from the reply
```

In the Sandbox, open **Headers** and add `Authorization` with the value `Bearer <your token>`. Run the query again:

*Response*

```json
{
  "data": {
    "categories": [
      { "id": 9, "name": "Electronics", "isActive": true },
      { "id": 10, "name": "iPhone", "isActive": true }
    ]
  }
}
```

> [!TIP]
> **Check:** log in as a user with only the *viewer* role. `categories` works, but the mutations you add next answer *"You don't have permission to do this"*. One permission system now protects both APIs, and because `PermissionsGuard` reads permissions from the database on every request, removing a permission takes effect immediately in both.

## 6. Mutations: creating and changing data

Mutations take arguments. A complex argument needs an **input type**. You already have a class with the right fields and validation rules, `CategoryDto`, so don't copy it: decorate it for GraphQL as well. One class then serves both APIs, and a validation rule changed once applies everywhere.

**`api-nest/src/categories/dto/category.dto.ts`** (edit)

```ts
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim, trimToNull } from '../../common/transforms.js';

// the REST body and the GraphQL input are the same class, so the rules live in one place
@InputType('CategoryInput')
export class CategoryDto {
  @Field()
  @Transform(trim)
  @IsString({ message: 'Name is required' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must be at most 100 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsString({ message: 'Description must be text' })
  description?: string | null;

  // defaults to true when not sent
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be true or false' })
  isActive?: boolean;
}
```

The global `ValidationPipe` from `setup.ts` also runs on resolver arguments, so the trimming and the "Name is required" check work as they do in REST. Validation now happens in two layers. GraphQL first checks the *types* against the schema: `isActive: "yes"` is rejected with code `BAD_USER_INPUT` before your code runs. Then your class-validator rules check the *values*, such as an empty name or a negative price.

Now add the mutations to the resolver. This is the complete file:

**`api-nest/src/categories/graphql/categories.resolver.ts`** (edit)

```ts
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { CategoriesService } from '../categories.service.js';
import { CategoryDto } from '../dto/category.dto.js';
import { CategoryType } from './category.type.js';

@Resolver(() => CategoryType)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [CategoryType])
  @RequirePermissions('categories:read')
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => CategoryType)
  @RequirePermissions('categories:read')
  category(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Mutation(() => CategoryType)
  @RequirePermissions('categories:create')
  createCategory(@Args('input') input: CategoryDto) {
    return this.categoriesService.create(input);
  }

  @Mutation(() => CategoryType)
  @RequirePermissions('categories:update')
  updateCategory(@Args('id', { type: () => Int }, ParseIdPipe) id: number, @Args('input') input: CategoryDto) {
    return this.categoriesService.update(id, input);
  }

  @Mutation(() => Boolean)
  @RequirePermissions('categories:delete')
  async deleteCategory(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    await this.categoriesService.remove(id);
    return true;
  }
}
```

REST answers a delete with `204 No Content`. GraphQL fields must return something, so `deleteCategory` returns `true`.

### Use variables, not string building

Never paste user input into the query text. Declare variables in the operation and send their values separately. It's the GraphQL equivalent of parameterised SQL. In the Sandbox, put the values in the **Variables** panel:

*Sandbox · Operation*

```graphql
mutation CreateCategory($input: CategoryInput!) {
  createCategory(input: $input) {
    id
    name
    description
    isActive
  }
}
```

*Sandbox · Variables*

```json
{
  "input": {
    "name": "  Pens ",
    "description": "  "
  }
}
```

*Response: trimmed, blank description became null, isActive defaulted*

```json
{
  "data": {
    "createCategory": { "id": 26, "name": "Pens", "description": null, "isActive": true }
  }
}
```

## 7. Errors

GraphQL replies with HTTP **200** even when something fails. Errors go in an `errors` array, each with a `path` to the field that failed. Out of the box, Nest's exceptions come through badly:

- Validation failures say only *"Bad Request Exception"*, and the field messages are hidden.
- A `NotFoundException` or `ConflictException` gets the code `INTERNAL_SERVER_ERROR`.
- Every error includes a stack trace with your server's file paths.

A `formatError` function rewrites each error before it is sent. Turn the HTTP status Nest attached into a code the client can switch on:

**`api-nest/src/common/format-graphql-error.ts`** (new file)

```ts
import { GraphQLFormattedError } from 'graphql';

const CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

// what Nest puts in extensions.originalError when a resolver throws an HttpException
interface NestError {
  statusCode?: number;
  errors?: string[]; // from the ValidationPipe in setup.ts
}

// turns Nest's HTTP errors into clean GraphQL errors: the real message,
// a code the client can switch on, and no stack trace
export function formatGraphqlError(formatted: GraphQLFormattedError): GraphQLFormattedError {
  const original = formatted.extensions?.originalError as NestError | undefined;
  const { path, locations } = formatted;

  if (original?.errors) {
    return { message: original.errors.join(', '), path, locations, extensions: { code: 'BAD_REQUEST', errors: original.errors } };
  }
  if (original?.statusCode && CODES[original.statusCode]) {
    return { message: formatted.message, path, locations, extensions: { code: CODES[original.statusCode] } };
  }
  // anything unexpected: don't show the client what went wrong inside the server
  if (formatted.extensions?.code === 'INTERNAL_SERVER_ERROR') {
    return { message: 'Internal server error', path, locations, extensions: { code: 'INTERNAL_SERVER_ERROR' } };
  }
  return { message: formatted.message, path, locations, extensions: { code: formatted.extensions?.code } };
}
```

Uncomment `formatError: formatGraphqlError` in `app.module.ts`. A duplicate name now gives:

*Response*

```json
{
  "errors": [
    {
      "message": "A category with this name already exists",
      "path": ["createCategory"],
      "locations": [{ "line": 1, "column": 12 }],
      "extensions": { "code": "CONFLICT" }
    }
  ],
  "data": null
}
```

### Fix the Sequelize filter

`SequelizeExceptionFilter` writes its answer to the Express response with `response.status(...).json(...)`. A GraphQL call has no response object to write to, so the filter itself would crash. Teach it to *return* an exception instead, which Apollo turns into a normal GraphQL error:

**`api-nest/src/common/sequelize-exception.filter.ts`** (edit)

```ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Response } from 'express';
import { BaseError, DatabaseError, ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';

// postgres error codes that are the client's fault, for errors no service handled itself
const invalidInput: Record<string, string> = {
  '22P02': 'Invalid value', // bad text for a number column
  '22003': 'Number is out of range',
};

const pgCode = (error: BaseError) =>
  error instanceof DatabaseError ? (error.parent as { code?: string }).code : undefined;

const toStatus = (error: BaseError): [number, string] => {
  if (error instanceof UniqueConstraintError) return [HttpStatus.CONFLICT, 'This value already exists'];
  if (error instanceof ForeignKeyConstraintError) return [HttpStatus.CONFLICT, 'This record is still used by other records'];
  const code = pgCode(error);
  if (code && invalidInput[code]) return [HttpStatus.BAD_REQUEST, invalidInput[code]];
  console.error(error);
  return [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'];
};

// services turn the errors they expect into specific messages ("A category with this
// name already exists"); this is the fallback, so a database error is never a bare 500
@Catch(BaseError)
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(error: BaseError, host: ArgumentsHost) {
    const [status, message] = toStatus(error);

    // GraphQL has no response object to write to: returning the exception
    // lets Apollo put it in the "errors" array of the reply
    if (host.getType<GqlContextType>() === 'graphql') {
      return new HttpException({ statusCode: status, message }, status);
    }
    host.switchToHttp().getResponse<Response>().status(status).json({ message });
  }
}
```

> [!WARNING]
> Build that exception with an object, `new HttpException({ statusCode: status, message }, status)`. With a plain string, `new HttpException(message, status)`, Nest doesn't attach the status code, so `formatGraphqlError` can't map it. A product with a category that doesn't exist then comes back as `INTERNAL_SERVER_ERROR` instead of `CONFLICT`.

## 8. Relations: a product's category

Here GraphQL does something REST can't do neatly. `ProductType` has a `category` field, but no column holds it. A `@ResolveField` method computes it, and it runs *only if the query asks for it*. Clients that only want names never pay for the lookup.

*api-nest/src/products/graphql/products.resolver.ts: first version*

```ts
// inside ProductsResolver. To inject CategoriesService here, export it from
// CategoriesModule and add CategoriesModule to ProductsModule's imports
@ResolveField(() => CategoryType, { nullable: true })
@RequirePermissions('categories:read')
category(@Parent() product: ProductType) {
  return product.categoryId ? this.categoriesService.findOne(product.categoryId) : null;
}
```

`@Parent()` is the product being resolved. `@RequirePermissions('categories:read')` takes effect only because of `fieldResolverEnhancers: ['guards']` in step 2. A user without that permission still gets the product names, and only the `category` field fails with `FORBIDDEN`.

This works, but run `products { name category { name } }` with SQL logging on and count the queries.

## 9. The N+1 problem and DataLoader

The field resolver runs once per product. For 50 products that is 1 query for the list plus 50 queries for categories: **N+1 queries**, mostly fetching the same few categories again and again. It's the classic GraphQL performance trap.

A **DataLoader** fixes it. Each resolver calls `loader.load(id)`. The loader waits until all resolvers in the current tick have asked, then makes *one* call with every id. It also caches, so each id is fetched once per request.

*Terminal*

```bash
npm install dataloader
```

Give the repository a method that fetches many categories at once:

**`api-nest/src/categories/categories.repository.ts`**

```ts
import { Op } from 'sequelize';

// inside CategoriesRepository
async findByIds(ids: number[]) {
  const categories = await this.categoryModel.findAll({ where: { id: { [Op.in]: ids } } });
  return categories.map((category) => category.toJSON());
}
```

**`api-nest/src/categories/graphql/categories.loader.ts`** (new file)

```ts
import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CategoriesRepository } from '../categories.repository.js';
import { CategoryType } from './category.type.js';

// one loader per request: every category asked for while resolving a query
// is fetched in a single SELECT ... WHERE id IN (...)
@Injectable({ scope: Scope.REQUEST })
export class CategoriesLoader extends DataLoader<number, CategoryType | null> {
  constructor(categoriesRepository: CategoriesRepository) {
    super(async (ids) => {
      const categories: CategoryType[] = await categoriesRepository.findByIds([...ids]);
      const byId = new Map(categories.map((category) => [category.id, category]));
      return ids.map((id) => byId.get(id) ?? null); // same order as the ids asked for
    });
  }
}
```

> [!NOTE]
> **Why `Scope.REQUEST`:** the loader caches what it loads. A single loader shared by everyone would keep serving stale categories forever, and could leak data between users. Request scope gives every HTTP request a fresh loader that is thrown away afterwards.

Provide and export it from `CategoriesModule`, then import `CategoriesModule` in `ProductsModule`:

**`api-nest/src/categories/categories.module.ts`** (edit)

```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesController } from './categories.controller.js';
import { CategoriesRepository } from './categories.repository.js';
import { CategoriesService } from './categories.service.js';
import { Category } from './category.model.js';
import { CategoriesLoader } from './graphql/categories.loader.js';
import { CategoriesResolver } from './graphql/categories.resolver.js';

@Module({
  imports: [SequelizeModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, CategoriesResolver, CategoriesLoader],
  exports: [CategoriesLoader],
})
export class CategoriesModule {}
```

**`api-nest/src/products/products.module.ts`** (edit)

```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesModule } from '../categories/categories.module.js';
import { ProductsResolver } from './graphql/products.resolver.js';
import { Product } from './product.model.js';
import { ProductsController } from './products.controller.js';
import { ProductsRepository } from './products.repository.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [SequelizeModule.forFeature([Product]), CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository, ProductsResolver],
  exports: [ProductsRepository],
})
export class ProductsModule {}
```

The products resolver now uses the loader. Its mutations are exercise 2:

**`api-nest/src/products/graphql/products.resolver.ts`** (new file)

```ts
import { Args, Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CategoriesLoader } from '../../categories/graphql/categories.loader.js';
import { CategoryType } from '../../categories/graphql/category.type.js';
import { ParseIdPipe } from '../../common/parse-id.pipe.js';
import { RequirePermissions } from '../../permissions/require-permissions.decorator.js';
import { ProductsService } from '../products.service.js';
import { ProductType } from './product.type.js';

@Resolver(() => ProductType)
export class ProductsResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesLoader: CategoriesLoader,
  ) {}

  @Query(() => [ProductType])
  @RequirePermissions('products:read')
  products() {
    return this.productsService.findAll();
  }

  @Query(() => ProductType)
  @RequirePermissions('products:read')
  product(@Args('id', { type: () => Int }, ParseIdPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // runs once per product, only when the query selects `category`
  @ResolveField(() => CategoryType, { nullable: true })
  @RequirePermissions('categories:read')
  category(@Parent() product: ProductType) {
    return product.categoryId ? this.categoriesLoader.load(product.categoryId) : null;
  }
}
```

Now the whole `products { name price category { name } }` query runs exactly three SQL statements, however many products there are:

1. `SELECT … FROM user_roles … permissions`: `PermissionsGuard` caches them on the request, so the guard running for every `category` field adds no queries.
2. `SELECT … FROM products ORDER BY id`
3. `SELECT … FROM categories WHERE id IN (…)`

> [!TIP]
> **See it yourself:** in `database.module.ts`, temporarily change `logging: false` to `logging: console.log`, run the query, and count the `Executing` lines with and without the loader.

## 10. Call it from React

A GraphQL request is a `POST` with a JSON body of `{ query, variables }`. You don't need a library for that. Add a helper next to `apiFetch.js` that sends the token and turns `errors` into a thrown `Error`, the way `handleResponse` does. Because GraphQL answers 200 even for an expired token, the helper checks the `UNAUTHENTICATED` code to send the user back to the login page:

**`app/src/services/graphqlFetch.js`**

```js
import { getToken, setToken, SESSION_EXPIRED_EVENT } from "./apiFetch";

const GRAPHQL_URL = `${import.meta.env.VITE_API_URL}/graphql`;

// sends one GraphQL operation with the login token and returns its `data`.
// GraphQL answers 200 even when something fails, so errors are read from the body
// and thrown with the server's messages, like handleResponse does for REST
const graphqlFetch = async (query, variables = {}) => {
    const token = getToken();

    let response;
    try {
        response = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({ query, variables })
        });
    } catch {
        throw new Error("Can't reach the server, please try again");
    }

    let body;
    try {
        body = await response.json();
    } catch {
        throw new Error("Request failed");
    }

    if (body.errors?.length) {
        // a rejected token: send the user back to the login page
        if (token && body.errors.some((error) => error.extensions?.code === "UNAUTHENTICATED")) {
            setToken(null);
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw new Error(body.errors.map((error) => error.message).join(", "));
    }

    return body.data;
}

export default graphqlFetch;
```

### Convert a service

Keep the same function names and return the same shapes, and the views never notice the switch. Here is the categories service on GraphQL:

**`app/src/services/categoryService.js`**

```js
import graphqlFetch from "./graphqlFetch";

const CATEGORY = `id name description isActive createdAt`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (category) => ({
    name: category.name,
    description: category.description,
    isActive: category.isActive
});

export const getCategories = async () => {
    const data = await graphqlFetch(`query Categories { categories { ${CATEGORY} } }`);
    return data.categories;
}

export const getCategoryById = async (id) => {
    const data = await graphqlFetch(
        `query Category($id: Int!) { category(id: $id) { ${CATEGORY} } }`,
        { id: Number(id) }
    );
    return data.category;
}

export const createCategory = async (category) => {
    const data = await graphqlFetch(
        `mutation CreateCategory($input: CategoryInput!) { createCategory(input: $input) { ${CATEGORY} } }`,
        { input: toInput(category) }
    );
    return data.createCategory;
}

export const updateCategory = async (id, category) => {
    const data = await graphqlFetch(
        `mutation UpdateCategory($id: Int!, $input: CategoryInput!) { updateCategory(id: $id, input: $input) { ${CATEGORY} } }`,
        { id: Number(id), input: toInput(category) }
    );
    return data.updateCategory;
}

export const deleteCategory = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteCategory($id: Int!) { deleteCategory(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteCategory;
}
```

> [!WARNING]
> REST silently dropped fields it didn't expect. GraphQL rejects the whole request instead: *"Variable "$input" got invalid value …; Field "id" is not defined by type "CategoryInput"."* Forms often hold extra fields (an `id`, a `createdAt`, a `confirmPassword`), so build the input from the fields the schema expects, as `toInput` does above.

### Ask for more in one request

Now use what REST couldn't do. Put queries in a service file, like the REST services:

**`app/src/services/catalogGraphqlService.js`**

```js
import graphqlFetch from "./graphqlFetch";

const PRODUCTS_WITH_CATEGORY = `
    query ProductsWithCategory {
        products {
            id
            name
            description
            price
            quantity
            category { id name }
        }
    }
`;

export const getProductsWithCategory = async () => {
    const data = await graphqlFetch(PRODUCTS_WITH_CATEGORY);
    return data.products;
}

const CREATE_CATEGORY = `
    mutation CreateCategory($input: CategoryInput!) {
        createCategory(input: $input) { id name description isActive }
    }
`;

export const createCategory = async (input) => {
    const data = await graphqlFetch(CREATE_CATEGORY, { input });
    return data.createCategory;
}
```

The Products table can now show categories with a single request. In `ProductsView.jsx`, change the fetch function, then add a column to `ProductsTable.jsx`:

*app/src/views/ProductsView.jsx and app/src/components/ProductsTable.jsx*

```jsx
// ProductsView.jsx
import { getProductsWithCategory } from "../services/catalogGraphqlService";
// ...
} = useFetch(getProductsWithCategory);

// ProductsTable.jsx: a header cell and a body cell
<th>Category</th>
// ...
<td>{product.category?.name ?? "No category"}</td>
```

> [!WARNING]
> Define queries and service functions at module level, never inside a component. `useFetch` re-runs whenever the function you pass changes, so a function created on every render fetches in an endless loop.

Larger apps often use a client library such as Apollo Client, urql or TanStack Query, which add caching and typed hooks. For this project, the small helper does the job and shows what those libraries do underneath.

## Exercises

1. **Suppliers.** Add `SupplierType` and a `SuppliersResolver` with queries and mutations. Reuse `SupplierDto` as the input type, as in step 6, then switch `supplierService.js` to GraphQL.
2. **Products mutations.** Add `createProduct`, `updateProduct` and `deleteProduct`. Check that deleting a product that has orders returns the `CONFLICT` code.
3. **The other direction.** Give `CategoryType` a `products` field that lists its products. Write a `ProductsByCategoryLoader` whose batch function returns an *array* of products per category id.
4. **Orders.** Add `OrderType` with a `product` field resolved through a `ProductsLoader`, and drop the flattened `productName` from the GraphQL version.
5. **Arguments.** Add optional `search: String` and `limit: Int` arguments to the `products` query and pass them down to the repository (`Op.iLike` for the search).
6. **Login over GraphQL.** Add `register` and `login` mutations marked `@Public()` that return `{ token user }`, and a `me` query. Read the user id with `@Context('req') request: AuthenticatedRequest`. Then switch `authService.js` so the whole app runs on GraphQL.

## Troubleshooting

| You see | Cause and fix |
| --- | --- |
| Query root type must be provided | No resolver has a `@Query` yet, or the resolver isn't in a module's `providers`. |
| Undefined type error | A `string \| null` (or other union) field without an explicit type. Use `@Field(() => String, { nullable: true })`. |
| Ids show up as `Float!` | A `number` field without a type defaults to `Float`. Use `@Field(() => Int)`. |
| Cannot return null for non-nullable field | The value was null but the field isn't `nullable: true`. |
| Cannot read properties of undefined (reading 'headers') | The guards still use `switchToHttp()`, or `context` is missing from `GraphQLModule`. See step 5. |
| Field "x" is not defined by type "…Input" | The client sent a field the input type doesn't have. Send only the schema's fields (step 10). |
| A permission on a `@ResolveField` has no effect | Add `fieldResolverEnhancers: ['guards']` to `GraphQLModule`. |
| A database conflict comes back as INTERNAL_SERVER_ERROR | The exception filter returns `new HttpException(message, status)`. Pass an object with `statusCode` (step 7). |
| response.status is not a function | An exception filter writes to the HTTP response during a GraphQL call. Check `host.getType()` and return the exception instead. |
| Field is missing from the schema | Look in `src/schema.gql`. If it's not there, the class is missing `@Field` or the resolver isn't registered. |
| Sandbox shows a CSRF error | Apollo blocks `GET` requests without a preflight header. Send operations with `POST` and `Content-Type: application/json`. |

---

Every code sample here comes from the CSIS279 `api-nest` project with GraphQL added (NestJS 12, @nestjs/graphql 14, Apollo Server 5, Sequelize 6), and every error message quoted was produced by running it. With the changes, the project's REST end-to-end tests still pass, a GraphQL end-to-end suite passes, and the React app works end to end over GraphQL only. The finished code is in this repository: each feature's `graphql/` folder in `api-nest/src`, and `app/src/services`.
