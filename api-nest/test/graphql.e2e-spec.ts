import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

interface GqlError {
  message: string;
  extensions: { code: string; errors?: string[] };
}

// every query and mutation the React app uses, against the database in .env.
// everything the tests create is tagged with `tag` and deleted at the end
describe('GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let db: Sequelize;
  const tag = `gql${Date.now()}`;
  const password = 'password123';
  let adminToken = '';
  let adminId = 0;

  // sends one operation; returns { data, errors } like a client would see it
  const gql = async (query: string, variables: object = {}, token = adminToken) => {
    const req = request(app.getHttpServer()).post('/api/graphql').send({ query, variables });
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req;
    return res.body as { data: Record<string, any> | null; errors?: GqlError[] };
  };
  // expects the operation to fail with this code (and message, when given)
  const fails = async (query: string, variables: object, code: string, message?: string, token = adminToken) => {
    const { errors } = await gql(query, variables, token);
    expect(errors?.[0].extensions.code).toBe(code);
    if (message) expect(errors?.[0].message).toBe(message);
    return errors![0];
  };
  const sql = (query: string, bind: unknown[] = []) => db.query(query, { bind });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    db = app.get(Sequelize);

    const { data } = await gql(
      `mutation Register($input: RegisterInput!) { register(input: $input) { token user { id } } }`,
      { input: { firstName: 'Admin', lastName: tag, email: `${tag}-admin@test.local`, password } },
      '',
    );
    adminToken = data!.register.token;
    adminId = data!.register.user.id;
    await sql(`INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = 'admin'`, [adminId]);
  });

  afterAll(async () => {
    await sql(`DELETE FROM orders WHERE product_id IN (SELECT id FROM products WHERE name LIKE $1)`, [`${tag}%`]);
    await sql(`DELETE FROM products WHERE name LIKE $1`, [`${tag}%`]);
    await sql(`DELETE FROM supplier WHERE name LIKE $1`, [`${tag}%`]);
    await sql(`DELETE FROM categories WHERE name LIKE $1`, [`${tag}%`]);
    await sql(`DELETE FROM users WHERE email LIKE $1`, [`${tag}%`]);
    await sql(`DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE name LIKE $1)`, [`${tag}%`]);
    await sql(`DELETE FROM roles WHERE name LIKE $1`, [`${tag}%`]);
    await app.close();
  });

  describe('auth', () => {
    const LOGIN = `mutation Login($input: LoginInput!) { login(input: $input) { token user { id email permissions roles { name } } } }`;

    it('logs in with any email casing and returns roles and permissions', async () => {
      const { data } = await gql(LOGIN, { input: { email: ` ${tag.toUpperCase()}-ADMIN@test.local `, password } }, '');
      expect(data!.login.token).toBeTruthy();
      expect(data!.login.user.id).toBe(adminId);
      expect(data!.login.user.permissions).toContain('roles:manage');
      expect(data!.login.user.roles.map((r: { name: string }) => r.name)).toEqual(['admin', 'viewer']);
    });

    it('rejects a wrong password, a missing token and a bad token', async () => {
      await fails(LOGIN, { input: { email: `${tag}-admin@test.local`, password: 'wrong-password' } }, 'UNAUTHENTICATED', 'Invalid email or password', '');
      await fails('{ me { id } }', {}, 'UNAUTHENTICATED', 'Please log in to continue', '');
      await fails('{ me { id } }', {}, 'UNAUTHENTICATED', 'Your session has expired, please log in again', 'nope');
    });

    it('validates registration and rejects a duplicate email', async () => {
      const REGISTER = `mutation R($input: RegisterInput!) { register(input: $input) { token } }`;
      const error = await fails(REGISTER, { input: { firstName: ' ', lastName: 'x', email: 'bad', password: 'short' } }, 'BAD_REQUEST');
      expect(error.extensions.errors).toEqual(
        expect.arrayContaining(['First name is required', 'Invalid email', 'Password must be at least 8 characters']),
      );
      await fails(REGISTER, { input: { firstName: 'a', lastName: 'b', email: `${tag}-ADMIN@test.local`, password } }, 'CONFLICT', 'An account with this email already exists', '');
    });

    it('returns the current user without the password hash', async () => {
      const { data } = await gql('{ me { id firstName email permissions } }');
      expect(data!.me).toMatchObject({ id: adminId, firstName: 'Admin' });
      const { errors } = await gql('{ me { passwordHash } }');
      expect(errors?.[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED');
    });
  });

  describe('categories, products, suppliers and orders', () => {
    it('runs the full category flow', async () => {
      const CREATE = `mutation C($input: CategoryInput!) { createCategory(input: $input) { id name description isActive createdAt } }`;
      const { data } = await gql(CREATE, { input: { name: `  ${tag} Pens `, description: '  ' } });
      const id = data!.createCategory.id;
      expect(data!.createCategory).toMatchObject({ name: `${tag} Pens`, description: null, isActive: true });

      await fails(CREATE, { input: { name: `${tag} Pens` } }, 'CONFLICT', 'A category with this name already exists');
      await fails(CREATE, { input: { name: '  ' } }, 'BAD_REQUEST', 'Name is required');

      const updated = await gql(
        `mutation U($id: Int!, $input: CategoryInput!) { updateCategory(id: $id, input: $input) { name isActive } }`,
        { id, input: { name: `${tag} Ink`, isActive: false } },
      );
      expect(updated.data!.updateCategory).toEqual({ name: `${tag} Ink`, isActive: false });

      const list = await gql('{ categories { id } }');
      expect(list.data!.categories.some((c: { id: number }) => c.id === id)).toBe(true);
      expect((await gql(`{ category(id: ${id}) { name } }`)).data!.category.name).toBe(`${tag} Ink`);

      await gql(`mutation { deleteCategory(id: ${id}) }`);
      await fails(`{ category(id: ${id}) { id } }`, {}, 'NOT_FOUND', 'Category not found');
      await fails(`mutation { deleteCategory(id: ${id}) }`, {}, 'NOT_FOUND');
    });

    it('runs the product, supplier and order flows with their rules', async () => {
      const category = await gql(`mutation { createCategory(input: { name: "${tag} Cat" }) { id } }`);
      const categoryId = category.data!.createCategory.id;

      const CREATE_PRODUCT = `mutation P($input: ProductInput!) { createProduct(input: $input) { id name price quantity categoryId category { name } } }`;
      const product = await gql(CREATE_PRODUCT, { input: { name: `${tag} Pen`, price: 2.5, categoryId } });
      const productId = product.data!.createProduct.id;
      expect(product.data!.createProduct).toMatchObject({ price: 2.5, quantity: 0, categoryId, category: { name: `${tag} Cat` } });

      const invalid = await fails(CREATE_PRODUCT, { input: { name: 'x', price: -1, quantity: -2 } }, 'BAD_REQUEST');
      expect(invalid.extensions.errors).toEqual([
        'Price must be a number between 0 and 99999999.99',
        'Quantity must be a whole number between 0 and 2147483647',
      ]);
      await fails(CREATE_PRODUCT, { input: { name: 'x', price: 1, categoryId: 2147483647 } }, 'CONFLICT');

      const updatedProduct = await gql(
        `mutation U($id: Int!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { price categoryId } }`,
        { id: productId, input: { name: `${tag} Pen`, price: 3, quantity: 5, categoryId: null } },
      );
      expect(updatedProduct.data!.updateProduct).toEqual({ price: 3, categoryId: null });

      // suppliers
      const SUPPLIER = `mutation S($input: SupplierInput!) { createSupplier(input: $input) { id name email phone } }`;
      const supplier = await gql(SUPPLIER, { input: { name: `${tag} Sup`, email: ' s@test.local ', phone: '' } });
      const supplierId = supplier.data!.createSupplier.id;
      expect(supplier.data!.createSupplier).toMatchObject({ email: 's@test.local', phone: null });
      await fails(SUPPLIER, { input: { name: `${tag} Sup`, email: 's@test.local' } }, 'CONFLICT', 'A supplier with this name already exists');
      await fails(SUPPLIER, { input: { name: 'x', email: 'a@b' } }, 'BAD_REQUEST', 'Email is invalid');
      await sql('UPDATE products SET supplier_id = $1 WHERE id = $2', [supplierId, productId]);
      await fails(`mutation { deleteSupplier(id: ${supplierId}) }`, {}, 'CONFLICT', 'Supplier is still linked to products');
      await sql('UPDATE products SET supplier_id = NULL WHERE id = $1', [productId]);
      const editedSupplier = await gql(
        `mutation U($id: Int!, $input: SupplierInput!) { updateSupplier(id: $id, input: $input) { phone } }`,
        { id: supplierId, input: { name: `${tag} Sup`, email: 's@test.local', phone: '555' } },
      );
      expect(editedSupplier.data!.updateSupplier.phone).toBe('555');
      expect((await gql(`{ suppliers { id } }`)).data!.suppliers.some((s: { id: number }) => s.id === supplierId)).toBe(true);
      await gql(`mutation { deleteSupplier(id: ${supplierId}) }`);
      await fails(`{ supplier(id: ${supplierId}) { id } }`, {}, 'NOT_FOUND', 'Supplier not found');

      // orders
      const ORDER = `mutation O($input: OrderInput!) { createOrder(input: $input) { id productId productName quantity unitPrice } }`;
      const order = await gql(ORDER, { input: { productId, quantity: 4 } });
      const orderId = order.data!.createOrder.id;
      expect(order.data!.createOrder).toEqual({ id: orderId, productId, productName: `${tag} Pen`, quantity: 4, unitPrice: 3 });
      await fails(ORDER, { input: { productId: 2147483647, quantity: 1 } }, 'BAD_REQUEST', 'Product does not exist');
      await fails(ORDER, { input: { productId, quantity: 0 } }, 'BAD_REQUEST', 'Quantity must be a whole number between 1 and 2147483647');

      const updatedOrder = await gql(
        `mutation U($id: Int!, $input: OrderInput!) { updateOrder(id: $id, input: $input) { quantity unitPrice } }`,
        { id: orderId, input: { productId, quantity: 2, unitPrice: 1.239 } },
      );
      expect(updatedOrder.data!.updateOrder).toEqual({ quantity: 2, unitPrice: 1.24 });
      expect((await gql(`{ orders { id productName } }`)).data!.orders).toContainEqual({ id: orderId, productName: `${tag} Pen` });
      expect((await gql(`{ order(id: ${orderId}) { quantity } }`)).data!.order.quantity).toBe(2);

      await fails(`mutation { deleteProduct(id: ${productId}) }`, {}, 'CONFLICT', 'Product has orders and cannot be deleted');
      await gql(`mutation { deleteOrder(id: ${orderId}) }`);
      await fails(`{ order(id: ${orderId}) { id } }`, {}, 'NOT_FOUND', 'Order not found');
      expect((await gql(`mutation { deleteProduct(id: ${productId}) }`)).data!.deleteProduct).toBe(true);
      await fails(`{ product(id: ${productId}) { id } }`, {}, 'NOT_FOUND', 'Product not found');
      await gql(`mutation { deleteCategory(id: ${categoryId}) }`);
    });
  });

  describe('users, roles and permissions', () => {
    const ROLE_FIELDS = 'id name description isSystem isDefault permissions userCount';

    it('lists permissions and roles, and protects the admin role', async () => {
      const { data } = await gql(`{ permissions { code } roles { ${ROLE_FIELDS} } }`);
      const codes = data!.permissions.map((p: { code: string }) => p.code);
      expect(codes).toContain('products:read');
      const admin = data!.roles.find((r: { name: string }) => r.name === 'admin');
      expect(admin).toMatchObject({ isSystem: true, permissions: [...codes].sort((a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)) });
      await fails(`mutation { updateRole(id: ${admin.id}, input: { name: "admin", permissions: [] }) { id } }`, {}, 'CONFLICT', "The admin role is built in and can't be changed");
      await fails(`mutation { deleteRole(id: ${admin.id}) }`, {}, 'CONFLICT');
    });

    it('runs the user and role flows', async () => {
      const ROLE = `mutation R($input: RoleInput!) { createRole(input: $input) { ${ROLE_FIELDS} } }`;
      await fails(ROLE, { input: { name: `${tag}r`, permissions: ['nope:read'] } }, 'BAD_REQUEST', 'Unknown permissions: nope:read');
      const role = await gql(ROLE, { input: { name: `${tag}r`, description: ' clerk ', permissions: ['orders:read', 'categories:read', 'orders:read'] } });
      const roleId = role.data!.createRole.id;
      expect(role.data!.createRole).toEqual({
        id: roleId, name: `${tag}r`, description: 'clerk', isSystem: false, isDefault: false,
        permissions: ['categories:read', 'orders:read'], userCount: 0,
      });
      await fails(ROLE, { input: { name: `${tag}R`, permissions: [] } }, 'CONFLICT', 'A role with this name already exists');

      const updatedRole = await gql(
        `mutation U($id: Int!, $input: RoleInput!) { updateRole(id: $id, input: $input) { name permissions } }`,
        { id: roleId, input: { name: `${tag}r2`, permissions: ['products:read'] } },
      );
      expect(updatedRole.data!.updateRole).toEqual({ name: `${tag}r2`, permissions: ['products:read'] });

      // users
      const USER = `mutation C($input: UserInput!) { createUser(input: $input) { id firstName age roles { id name } } }`;
      const user = await gql(USER, { input: { firstName: ' Mia ', lastName: tag, email: `${tag}-mia@test.local`, age: 30 } });
      const userId = user.data!.createUser.id;
      expect(user.data!.createUser).toEqual({ id: userId, firstName: 'Mia', age: 30, roles: [] });
      await fails(USER, { input: { firstName: 'a', lastName: 'b', email: `${tag}-MIA@test.local` } }, 'CONFLICT', 'A user with this email already exists');
      await fails(USER, { input: { firstName: 'a', lastName: 'b', email: 'x@example.com', age: 200 } }, 'BAD_REQUEST', 'Age must be a whole number between 0 and 150');

      const ROLES = `mutation A($id: Int!, $input: UserRolesInput!) { updateUserRoles(id: $id, input: $input) { roles { id name } } }`;
      await fails(ROLES, { id: adminId, input: { roleIds: [] } }, 'CONFLICT', "You can't change your own roles");
      await fails(ROLES, { id: userId, input: { roleIds: [2147483647] } }, 'BAD_REQUEST', 'One or more roles do not exist');
      const assigned = await gql(ROLES, { id: userId, input: { roleIds: [roleId, roleId] } });
      expect(assigned.data!.updateUserRoles.roles).toEqual([{ id: roleId, name: `${tag}r2` }]);
      expect((await gql(`{ role(id: ${roleId}) { userCount } }`)).data!.role.userCount).toBe(1);
      await fails(`mutation { deleteRole(id: ${roleId}) }`, {}, 'CONFLICT', 'Role is assigned to users and cannot be deleted');

      const updatedUser = await gql(
        `mutation U($id: Int!, $input: UserInput!) { updateUser(id: $id, input: $input) { firstName age } }`,
        { id: userId, input: { firstName: 'Janet', lastName: tag, email: `${tag}-mia@test.local`, age: null } },
      );
      expect(updatedUser.data!.updateUser).toEqual({ firstName: 'Janet', age: null });
      expect((await gql('{ users { id } }')).data!.users.some((u: { id: number }) => u.id === userId)).toBe(true);
      expect((await gql(`{ user(id: ${userId}) { email } }`)).data!.user.email).toBe(`${tag}-mia@test.local`);

      await gql(`mutation { deleteUser(id: ${userId}) }`);
      await fails(`{ user(id: ${userId}) { id } }`, {}, 'NOT_FOUND', 'User not found');
      expect((await gql(`mutation { deleteRole(id: ${roleId}) }`)).data!.deleteRole).toBe(true);
    });

    it('keeps a single default role', async () => {
      const [[original]] = (await sql('SELECT id FROM roles WHERE is_default')) as [{ id: number }[], unknown];
      const { data } = await gql(`mutation { createRole(input: { name: "${tag}d", isDefault: true, permissions: [] }) { id isDefault } }`);
      try {
        expect(data!.createRole.isDefault).toBe(true);
        const [defaults] = (await sql('SELECT id FROM roles WHERE is_default')) as [{ id: number }[], unknown];
        expect(defaults).toEqual([{ id: data!.createRole.id }]);
      } finally {
        await sql('UPDATE roles SET is_default = false WHERE id <> $1', [original.id]);
        await sql('UPDATE roles SET is_default = true WHERE id = $1', [original.id]);
      }
    });

    it('enforces permissions on queries, mutations and fields, and applies changes right away', async () => {
      const { data } = await gql(
        `mutation R($input: RegisterInput!) { register(input: $input) { token user { id permissions } } }`,
        { input: { firstName: 'V', lastName: tag, email: `${tag}-v@test.local`, password } },
        '',
      );
      const viewer = data!.register.token;
      expect(data!.register.user.permissions).not.toContain('products:create');

      expect((await gql('{ products { id } categories { id } suppliers { id } orders { id } }', {}, viewer)).errors).toBeUndefined();
      for (const query of ['{ users { id } }', '{ roles { id } }', '{ permissions { id } }']) {
        await fails(query, {}, 'FORBIDDEN', "You don't have permission to do this", viewer);
      }
      await fails(`mutation { createProduct(input: { name: "x", price: 1 }) { id } }`, {}, 'FORBIDDEN', undefined, viewer);

      // Product.category needs categories:read; take it away and only that field fails
      const [[role]] = (await sql(`INSERT INTO roles (name) VALUES ($1) RETURNING id`, [`${tag}p`])) as [{ id: number }[], unknown];
      await sql(`INSERT INTO role_permissions (role_id, permission_id) SELECT $1, id FROM permissions WHERE code = 'products:read'`, [role.id]);
      await gql(`mutation { updateUserRoles(id: ${data!.register.user.id}, input: { roleIds: [${role.id}] }) { id } }`);
      await fails('{ categories { id } }', {}, 'FORBIDDEN', undefined, viewer);
      const [[withCategory]] = (await sql('SELECT id FROM products WHERE category_id IS NOT NULL LIMIT 1')) as [{ id: number }[], unknown];
      if (withCategory) {
        await fails(`{ product(id: ${withCategory.id}) { name category { name } } }`, {}, 'FORBIDDEN', undefined, viewer);
      }
    });
  });

  it('turns ids that cannot exist into NOT_FOUND', async () => {
    for (const field of ['user', 'role', 'product', 'category', 'supplier', 'order']) {
      await fails(`{ ${field}(id: -1) { id } }`, {}, 'NOT_FOUND');
    }
  });
});
