import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

// every endpoint the React app uses, against the database in .env.
// everything the tests create is tagged with `tag` and deleted at the end
describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let db: Sequelize;
  const tag = `e2e${Date.now()}`;
  const password = 'password123';
  const admin = { id: 0, token: '' };
  const created = { users: [] as number[], roles: [] as number[], products: [] as number[], categories: [] as number[], suppliers: [] as number[], orders: [] as number[] };

  const server = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${admin.token}` });
  const sql = (query: string, bind: unknown[] = []) => db.query(query, { bind });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    db = app.get(Sequelize);

    const reg = await server()
      .post('/api/auth/register')
      .send({ firstName: 'Admin', lastName: tag, email: `${tag}-admin@test.local`, password })
      .expect(201);
    admin.id = reg.body.user.id;
    admin.token = reg.body.token;
    created.users.push(admin.id);
    await sql(`INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = 'admin'`, [admin.id]);
  });

  afterAll(async () => {
    const remove = (table: string, key: string, ids: number[]) =>
      ids.length ? sql(`DELETE FROM ${table} WHERE ${key} = ANY($1::int[])`, [ids]) : undefined;
    await remove('orders', 'order_id', created.orders);
    await remove('products', 'id', created.products);
    await remove('supplier', 'supplier_id', created.suppliers);
    await remove('categories', 'id', created.categories);
    await remove('users', 'id', created.users); // user_roles cascade
    await remove('user_roles', 'role_id', created.roles);
    await remove('roles', 'id', created.roles);
    await app.close();
  });

  describe('auth', () => {
    it('returns the session user with roles and permissions, never the hash', async () => {
      const me = await server().get('/api/auth/me').set(auth()).expect(200);
      expect(me.body).toMatchObject({ id: admin.id, firstName: 'Admin', email: `${tag}-admin@test.local` });
      expect(me.body.roles.map((r: { name: string }) => r.name)).toEqual(['admin', 'viewer']);
      expect(me.body.permissions).toContain('roles:manage');
      expect(me.body.passwordHash).toBeUndefined();
    });

    it('logs in with any email casing', async () => {
      const res = await server()
        .post('/api/auth/login')
        .send({ email: `  ${tag.toUpperCase()}-ADMIN@test.local `, password })
        .expect(200);
      expect(res.body.user.id).toBe(admin.id);
    });

    it('validates login and registration with one message per field', async () => {
      const login = await server().post('/api/auth/login').send({}).expect(400);
      expect(login.body.errors).toEqual(['Email is required', 'Password is required']);
      const reg = await server().post('/api/auth/register').send({ firstName: 'a', lastName: 'b', email: '', password }).expect(400);
      expect(reg.body.errors).toEqual(['Email is required']);
    });
  });

  describe('users', () => {
    let userId: number;

    it('creates a user without a password who cannot log in', async () => {
      const res = await server()
        .post('/api/users')
        .set(auth())
        .send({ firstName: ' Jane ', lastName: 'Doe', email: `${tag}-jane@test.local`, age: '30' })
        .expect(201);
      userId = res.body.id;
      created.users.push(userId);
      expect(res.body).toMatchObject({ firstName: 'Jane', lastName: 'Doe', age: 30, roles: [] });
      expect(res.body.passwordHash).toBeUndefined();
      await server().post('/api/auth/login').send({ email: `${tag}-jane@test.local`, password }).expect(401);
    });

    it('rejects duplicate emails ignoring case and invalid fields', async () => {
      const dup = await server()
        .post('/api/users')
        .set(auth())
        .send({ firstName: 'J', lastName: 'D', email: `${tag}-JANE@test.local` })
        .expect(409);
      expect(dup.body.message).toBe('A user with this email already exists');

      const bad = await server().post('/api/users').set(auth()).send({ email: 'nope', age: 200 }).expect(400);
      expect(bad.body.errors).toEqual(
        expect.arrayContaining(['First name is required', 'Last name is required', 'Invalid email', 'Age must be a whole number between 0 and 150']),
      );
    });

    it('lists, reads and updates users', async () => {
      const list = await server().get('/api/users').set(auth()).expect(200);
      expect(list.body.some((u: { id: number }) => u.id === userId)).toBe(true);
      expect(list.body.every((u: object) => !('passwordHash' in u))).toBe(true);

      const updated = await server()
        .put(`/api/users/${userId}`)
        .set(auth())
        .send({ firstName: 'Janet', lastName: 'Doe', email: `${tag}-jane@test.local`, age: null })
        .expect(200);
      expect(updated.body).toMatchObject({ firstName: 'Janet', age: null });

      await server().get(`/api/users/${userId}`).set(auth()).expect(200);
      await server().get('/api/users/2147483647').set(auth()).expect(404);
    });

    it('assigns roles, but not your own or unknown ones', async () => {
      const own = await server().put(`/api/users/${admin.id}/roles`).set(auth()).send({ roleIds: [] }).expect(409);
      expect(own.body.message).toBe("You can't change your own roles");

      await server().put(`/api/users/${userId}/roles`).set(auth()).send({ roleIds: ['x'] }).expect(400);
      const unknown = await server().put(`/api/users/${userId}/roles`).set(auth()).send({ roleIds: [2147483647] }).expect(400);
      expect(unknown.body.message).toBe('One or more roles do not exist');

      const [[manager]] = (await sql(`SELECT id FROM roles WHERE name = 'manager'`)) as [{ id: number }[], unknown];
      const res = await server()
        .put(`/api/users/${userId}/roles`)
        .set(auth())
        .send({ roleIds: [manager.id, manager.id] })
        .expect(200);
      expect(res.body.roles).toEqual([{ id: manager.id, name: 'manager' }]);
    });

    it('deletes users', async () => {
      await server().delete(`/api/users/${userId}`).set(auth()).expect(204);
      await server().delete(`/api/users/${userId}`).set(auth()).expect(404);
    });
  });

  describe('categories', () => {
    it('runs the full CRUD flow', async () => {
      const invalid = await server().post('/api/categories').set(auth()).send({ name: ' ', isActive: 'yes' }).expect(400);
      expect(invalid.body.errors).toEqual(['Name is required', 'isActive must be true or false']);

      const res = await server()
        .post('/api/categories')
        .set(auth())
        .send({ name: ` ${tag} cat `, description: '  ' })
        .expect(201);
      const id = res.body.id;
      created.categories.push(id);
      expect(res.body).toMatchObject({ name: `${tag} cat`, description: null, isActive: true });
      expect(res.body.createdAt).toBeTruthy();

      const dup = await server().post('/api/categories').set(auth()).send({ name: `${tag} cat` }).expect(409);
      expect(dup.body.message).toBe('A category with this name already exists');

      const updated = await server()
        .put(`/api/categories/${id}`)
        .set(auth())
        .send({ name: `${tag} cat2`, description: 'd', isActive: false })
        .expect(200);
      expect(updated.body).toMatchObject({ name: `${tag} cat2`, description: 'd', isActive: false });

      // deleting a category keeps its products, without a category
      const product = await server().post('/api/products').set(auth()).send({ name: `${tag} p`, price: 1, categoryId: id }).expect(201);
      created.products.push(product.body.id);
      await server().delete(`/api/categories/${id}`).set(auth()).expect(204);
      const after = await server().get(`/api/products/${product.body.id}`).set(auth()).expect(200);
      expect(after.body.categoryId).toBeNull();

      await server().get(`/api/categories/${id}`).set(auth()).expect(404);
      await server().put(`/api/categories/${id}`).set(auth()).send({ name: 'x' }).expect(404);
    });
  });

  describe('suppliers', () => {
    it('runs the full CRUD flow', async () => {
      const invalid = await server().post('/api/suppliers').set(auth()).send({ name: 'x', email: 'a@b' }).expect(400);
      expect(invalid.body.errors).toEqual(['Email is invalid']);

      const res = await server()
        .post('/api/suppliers')
        .set(auth())
        .send({ name: `${tag} sup`, email: ' s@test.local ', phone: '' })
        .expect(201);
      const id = res.body.id;
      created.suppliers.push(id);
      expect(res.body).toMatchObject({ name: `${tag} sup`, email: 's@test.local', phone: null });
      expect(res.body.supplier_id).toBeUndefined();

      await server().post('/api/suppliers').set(auth()).send({ name: `${tag} sup`, email: 's@test.local' }).expect(409);

      const updated = await server()
        .put(`/api/suppliers/${id}`)
        .set(auth())
        .send({ name: `${tag} sup2`, email: 's2@test.local', phone: '123' })
        .expect(200);
      expect(updated.body).toMatchObject({ id, name: `${tag} sup2`, phone: '123' });

      const list = await server().get('/api/suppliers').set(auth()).expect(200);
      expect(list.body.some((s: { id: number }) => s.id === id)).toBe(true);

      // a supplier linked to products can't be deleted
      const product = await server().post('/api/products').set(auth()).send({ name: `${tag} p`, price: 1 }).expect(201);
      created.products.push(product.body.id);
      await sql('UPDATE products SET supplier_id = $1 WHERE id = $2', [id, product.body.id]);
      const inUse = await server().delete(`/api/suppliers/${id}`).set(auth()).expect(409);
      expect(inUse.body.message).toBe('Supplier is still linked to products');
      await sql('UPDATE products SET supplier_id = NULL WHERE id = $1', [product.body.id]);

      await server().delete(`/api/suppliers/${id}`).set(auth()).expect(204);
      await server().get(`/api/suppliers/${id}`).set(auth()).expect(404);
    });
  });

  describe('orders', () => {
    it('runs the full CRUD flow', async () => {
      const product = await server().post('/api/products').set(auth()).send({ name: `${tag} pen`, price: 2.5 }).expect(201);
      const productId = product.body.id;
      created.products.push(productId);

      const invalid = await server().post('/api/orders').set(auth()).send({ quantity: 0, unitPrice: -1 }).expect(400);
      expect(invalid.body.errors).toEqual([
        'Product is required',
        'Quantity must be a whole number between 1 and 2147483647',
        'Unit price must be a number between 0 and 99999999.99',
      ]);

      const missing = await server().post('/api/orders').set(auth()).send({ productId: 2147483647, quantity: 1 }).expect(400);
      expect(missing.body.message).toBe('Product does not exist');

      // no unit price: the product's current price is used
      const order = await server().post('/api/orders').set(auth()).send({ productId, quantity: 3 }).expect(201);
      const id = order.body.id;
      created.orders.push(id);
      expect(order.body).toEqual({ id, productId, quantity: 3, unitPrice: 2.5, productName: `${tag} pen` });

      const updated = await server()
        .put(`/api/orders/${id}`)
        .set(auth())
        .send({ productId, quantity: '2', unitPrice: '1.239' })
        .expect(200);
      expect(updated.body).toMatchObject({ quantity: 2, unitPrice: 1.24 });

      await server().put(`/api/orders/${id}`).set(auth()).send({ productId: 2147483647, quantity: 1 }).expect(400);
      await server().put('/api/orders/2147483647').set(auth()).send({ productId, quantity: 1 }).expect(404);

      const list = await server().get('/api/orders').set(auth()).expect(200);
      expect(list.body.find((o: { id: number }) => o.id === id)).toMatchObject({ productName: `${tag} pen` });

      // a product with orders can't be deleted
      const blocked = await server().delete(`/api/products/${productId}`).set(auth()).expect(409);
      expect(blocked.body.message).toBe('Product has orders and cannot be deleted');

      await server().delete(`/api/orders/${id}`).set(auth()).expect(204);
      await server().get(`/api/orders/${id}`).set(auth()).expect(404);
      await server().delete(`/api/products/${productId}`).set(auth()).expect(204);
    });
  });

  describe('roles and permissions', () => {
    it('lists permissions and roles', async () => {
      const permissions = await server().get('/api/permissions').set(auth()).expect(200);
      expect(permissions.body).toContainEqual({ id: expect.any(Number), code: 'products:read', description: 'View products' });

      const roles = await server().get('/api/roles').set(auth()).expect(200);
      const adminRole = roles.body.find((r: { name: string }) => r.name === 'admin');
      expect(adminRole).toMatchObject({ isSystem: true, isDefault: false });
      expect(adminRole.permissions).toEqual(permissions.body.map((p: { code: string }) => p.code).sort());
      expect(adminRole.userCount).toBeGreaterThanOrEqual(1);
    });

    it('creates, updates and deletes a role', async () => {
      const unknown = await server().post('/api/roles').set(auth()).send({ name: `${tag}r`, permissions: ['nope:read'] }).expect(400);
      expect(unknown.body.message).toBe('Unknown permissions: nope:read');
      const invalid = await server().post('/api/roles').set(auth()).send({ name: `${tag}r`, permissions: 'x' }).expect(400);
      expect(invalid.body.errors).toEqual(['Permissions must be a list of permission codes']);

      const res = await server()
        .post('/api/roles')
        .set(auth())
        .send({ name: `${tag}r`, description: ' clerk ', permissions: ['orders:read', 'categories:read', 'orders:read'] })
        .expect(201);
      const id = res.body.id;
      created.roles.push(id);
      expect(res.body).toEqual({
        id,
        name: `${tag}r`,
        description: 'clerk',
        isSystem: false,
        isDefault: false,
        permissions: ['categories:read', 'orders:read'],
        userCount: 0,
      });

      const dup = await server().post('/api/roles').set(auth()).send({ name: `${tag}R`, permissions: [] }).expect(409);
      expect(dup.body.message).toBe('A role with this name already exists');

      const updated = await server()
        .put(`/api/roles/${id}`)
        .set(auth())
        .send({ name: `${tag}r2`, permissions: ['products:read'] })
        .expect(200);
      expect(updated.body).toMatchObject({ name: `${tag}r2`, description: null, permissions: ['products:read'] });

      // a role in use can't be deleted
      const user = await server().post('/api/users').set(auth()).send({ firstName: 'R', lastName: 'U', email: `${tag}-r@test.local` }).expect(201);
      created.users.push(user.body.id);
      await server().put(`/api/users/${user.body.id}/roles`).set(auth()).send({ roleIds: [id] }).expect(200);
      expect((await server().get(`/api/roles/${id}`).set(auth()).expect(200)).body.userCount).toBe(1);
      const inUse = await server().delete(`/api/roles/${id}`).set(auth()).expect(409);
      expect(inUse.body.message).toBe('Role is assigned to users and cannot be deleted');

      await server().put(`/api/users/${user.body.id}/roles`).set(auth()).send({ roleIds: [] }).expect(200);
      await server().delete(`/api/roles/${id}`).set(auth()).expect(204);
      await server().get(`/api/roles/${id}`).set(auth()).expect(404);
    });

    it('protects the built-in admin role', async () => {
      const roles = await server().get('/api/roles').set(auth()).expect(200);
      const adminRole = roles.body.find((r: { name: string }) => r.name === 'admin');
      const res = await server().put(`/api/roles/${adminRole.id}`).set(auth()).send({ name: 'admin', permissions: [] }).expect(409);
      expect(res.body.message).toBe("The admin role is built in and can't be changed");
      await server().delete(`/api/roles/${adminRole.id}`).set(auth()).expect(409);
    });

    it('keeps a single default role', async () => {
      const [[viewer]] = (await sql(`SELECT id FROM roles WHERE is_default`)) as [{ id: number }[], unknown];
      const res = await server()
        .post('/api/roles')
        .set(auth())
        .send({ name: `${tag}d`, isDefault: true, permissions: [] })
        .expect(201);
      created.roles.push(res.body.id);
      try {
        expect(res.body.isDefault).toBe(true);
        const [defaults] = (await sql(`SELECT id FROM roles WHERE is_default`)) as [{ id: number }[], unknown];
        expect(defaults).toEqual([{ id: res.body.id }]);
      } finally {
        await sql('UPDATE roles SET is_default = false WHERE id = $1', [res.body.id]);
        await sql('UPDATE roles SET is_default = true WHERE id = $1', [viewer.id]);
      }
    });

    it('applies removed permissions right away, without a new token', async () => {
      const reg = await server()
        .post('/api/auth/register')
        .send({ firstName: 'V', lastName: tag, email: `${tag}-v@test.local`, password })
        .expect(201);
      created.users.push(reg.body.user.id);
      const viewer = { Authorization: `Bearer ${reg.body.token}` };

      await server().get('/api/categories').set(viewer).expect(200);
      await server().get('/api/users').set(viewer).expect(403);
      await server().get('/api/roles').set(viewer).expect(403);
      await server().get('/api/permissions').set(viewer).expect(403);

      await server().put(`/api/users/${reg.body.user.id}/roles`).set(auth()).send({ roleIds: [] }).expect(200);
      await server().get('/api/categories').set(viewer).expect(403);
    });
  });

  it('turns ids that cannot exist into 404s', async () => {
    for (const path of ['users', 'roles', 'products', 'categories', 'suppliers', 'orders']) {
      await server().get(`/api/${path}/abc`).set(auth()).expect(404);
      await server().get(`/api/${path}/99999999999`).set(auth()).expect(404);
    }
  });
});
