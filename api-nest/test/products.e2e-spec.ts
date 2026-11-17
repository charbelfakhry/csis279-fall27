import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { Sequelize } from 'sequelize-typescript';
import { configureApp } from '../src/setup.js';

// runs against the database in .env: it creates a throwaway user and product
// and deletes them at the end
describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let db: Sequelize;
  let token: string;
  let userId: number;
  const email = `e2e-${Date.now()}@test.local`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    db = app.get(Sequelize);
  });

  afterAll(async () => {
    if (userId) await db.query('DELETE FROM users WHERE id = $1', { bind: [userId] });
    await app.close();
  });

  const server = () => request(app.getHttpServer());

  it('rejects requests without a token (401)', async () => {
    const res = await server().get('/api/products').expect(401);
    expect(res.body.message).toBe('Please log in to continue');
  });

  it('rejects a bad token (401)', async () => {
    await server().get('/api/products').set('Authorization', 'Bearer nope').expect(401);
  });

  it('validates registration', async () => {
    const res = await server().post('/api/auth/register').send({ email: 'x' }).expect(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining(['First name is required', 'Invalid email', 'Password must be at least 8 characters']),
    );
  });

  it('registers, then logs in as a viewer', async () => {
    const reg = await server()
      .post('/api/auth/register')
      .send({ firstName: 'E2E', lastName: 'Test', email, password })
      .expect(201);
    userId = reg.body.user.id;
    expect(reg.body.user.passwordHash).toBeUndefined();
    expect(reg.body.user.permissions).toContain('products:read');
    expect(reg.body.user.permissions).not.toContain('products:create');

    await server().post('/api/auth/register').send({ firstName: 'E2E', lastName: 'Test', email, password }).expect(409);
    await server().post('/api/auth/login').send({ email, password: 'wrong-password' }).expect(401);

    const login = await server().post('/api/auth/login').send({ email, password }).expect(200);
    token = login.body.token;

    const me = await server().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.email).toBe(email);
  });

  it('lets a viewer read but not create (403)', async () => {
    await server().get('/api/products').set('Authorization', `Bearer ${token}`).expect(200);
    const res = await server()
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nope', price: 1 })
      .expect(403);
    expect(res.body.message).toBe("You don't have permission to do this");
  });

  it('runs the full CRUD flow as a manager', async () => {
    await db.query(
      `INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = 'manager'`,
      { bind: [userId] },
    );
    const auth = { Authorization: `Bearer ${token}` };

    const invalid = await server().post('/api/products').set(auth).send({ name: '  ', price: -1, quantity: 1.5 }).expect(400);
    expect(invalid.body.errors).toEqual(
      expect.arrayContaining([
        'Name is required',
        'Price must be a number between 0 and 99999999.99',
        'Quantity must be a whole number between 0 and 2147483647',
      ]),
    );

    const created = await server()
      .post('/api/products')
      .set(auth)
      .send({ name: '  E2E product ', price: '12.50', quantity: 4, extra: 'dropped' })
      .expect(201);
    const id = created.body.id;
    expect(created.body).toMatchObject({ name: 'E2E product', price: 12.5, quantity: 4, categoryId: null });
    expect(created.body.extra).toBeUndefined();

    await server().get(`/api/products/${id}`).set(auth).expect(200);

    const updated = await server()
      .put(`/api/products/${id}`)
      .set(auth)
      .send({ name: 'E2E product 2', price: 20 })
      .expect(200);
    expect(updated.body).toMatchObject({ name: 'E2E product 2', price: 20, quantity: 0 });

    // unknown category -> foreign key violation, mapped to 409 by PgExceptionFilter
    await server().put(`/api/products/${id}`).set(auth).send({ name: 'x', price: 1, categoryId: 2147483647 }).expect(409);

    await server().delete(`/api/products/${id}`).set(auth).expect(204);
    await server().get(`/api/products/${id}`).set(auth).expect(404);
    await server().get('/api/products/abc').set(auth).expect(404);
    await server().delete(`/api/products/${id}`).set(auth).expect(404);
  });
});
