# api-nest

The NestJS version of `../api`, serving the same REST API to the React app in `../app`.
Data access uses **Sequelize** (`@nestjs/sequelize` + `sequelize-typescript`) over the existing PostgreSQL schema.

## Setup

```bash
npm install
cp .env.example .env   # then fill in the database and JWT_SECRET
npm run start:dev      # http://localhost:3000/api
```

The tables come from `../api/sql/*.sql` (Sequelize never creates or alters them: `synchronize: false`).
To make the first admin, register in the app and then:

```sql
INSERT INTO user_roles (user_id, role_id)
SELECT users.id, roles.id FROM users, roles
WHERE lower(users.email) = lower('you@example.com') AND roles.name = 'admin';
```

## Structure

Each feature is a module with a controller (routes + permission per route), a service (rules and error messages)
and a repository (Sequelize queries). Models live next to their feature (`products/product.model.ts`, ...)
and are all registered in `database/database.module.ts`.

| Route | Permission |
| --- | --- |
| `POST /api/auth/register`, `POST /api/auth/login` | public |
| `GET /api/auth/me` | logged in |
| `/api/users` (+ `PUT /:id/roles`) | `users:*` (`roles:manage` for roles) |
| `/api/products`, `/api/categories`, `/api/suppliers`, `/api/orders` | `<resource>:read/create/update/delete` |
| `/api/roles` | `roles:read`, `roles:manage` |
| `GET /api/permissions` | `roles:read` |

- `AuthGuard` (global) checks the `Authorization: Bearer <token>` header; `@Public()` opts a route out.
- `PermissionsGuard` (global) checks `@RequirePermissions(...)` against the database on every request,
  so removing a permission works immediately.
- Validation errors are `400 { errors: [...] }` with one message per field; other errors are `{ message }`.

## GraphQL

The React app talks to the API through GraphQL at **`POST /api/graphql`** (`app/src/services/graphqlFetch.js`).
The REST routes above still work and share the same services, so both APIs always behave the same.

- Code first: each feature has a `graphql/` folder with its object types and resolver. The DTOs double as
  input types (`@InputType`), so validation rules live in one place. The generated schema is `src/schema.gql`.
- Same security: `AuthGuard` and `PermissionsGuard` run for every query, mutation and `@ResolveField`
  (`Product.category` needs `categories:read`); `register` and `login` are `@Public()`.
- Errors come back in the `errors` array with HTTP 200. `extensions.code` is one of `BAD_REQUEST` (with
  `extensions.errors`, one message per field), `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`.
- `Product.category` is batched with a per-request DataLoader, so a product list costs one categories query.

Step-by-step tutorial on how this was built: [tutorials/graphql](../tutorials/graphql/README.md).

Open http://localhost:3000/api/graphql in a browser for the Apollo Sandbox. Add an `Authorization: Bearer <token>`
header (the token is in the React app's localStorage, or from the `login` mutation).

```graphql
mutation { login(input: { email: "you@example.com", password: "..." }) { token user { permissions } } }
query { products { name price category { name } } }
```

## Tests

```bash
npm test            # unit tests
npm run test:e2e    # every REST endpoint and GraphQL operation, against the database in .env (cleans up after itself)
```
