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

## Tests

```bash
npm test            # unit tests
npm run test:e2e    # every endpoint, against the database in .env (cleans up after itself)
```
