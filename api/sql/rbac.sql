-- Role-based access control (RBAC)
--
--   users ──< user_roles >── roles ──< role_permissions >── permissions
--
-- A user can have many roles, a role can have many permissions.
-- Permission codes are "<resource>:<action>" and are checked by the API
-- (requirePermission("products:delete")), so new permissions are added here,
-- together with the code that uses them. Roles are plain data and can be
-- managed from the Roles page.
--
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    description text,
    -- system roles (admin) can't be edited or deleted, so nobody can lock everyone out
    is_system boolean NOT NULL DEFAULT false,
    -- the role given to newly registered accounts
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- role names are unique ignoring case
CREATE UNIQUE INDEX IF NOT EXISTS roles_name_lower_key ON public.roles (lower(name));

-- at most one default role
CREATE UNIQUE INDEX IF NOT EXISTS roles_single_default_key ON public.roles (is_default) WHERE is_default;

CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    code text NOT NULL UNIQUE,
    description text
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id integer NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id integer NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- deleting a user removes their role assignments,
-- but a role that is still assigned to users can't be deleted (no cascade)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id integer NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id integer NOT NULL REFERENCES public.roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- the primary key already indexes user_id first; this one speeds up lookups by role
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles (role_id);


-- ---------- seed data ----------

INSERT INTO public.permissions (code, description) VALUES
    ('users:read', 'View users'),
    ('users:create', 'Create users'),
    ('users:update', 'Edit users'),
    ('users:delete', 'Delete users'),
    ('products:read', 'View products'),
    ('products:create', 'Create products'),
    ('products:update', 'Edit products'),
    ('products:delete', 'Delete products'),
    ('categories:read', 'View categories'),
    ('categories:create', 'Create categories'),
    ('categories:update', 'Edit categories'),
    ('categories:delete', 'Delete categories'),
    ('suppliers:read', 'View suppliers'),
    ('suppliers:create', 'Create suppliers'),
    ('suppliers:update', 'Edit suppliers'),
    ('suppliers:delete', 'Delete suppliers'),
    ('orders:read', 'View orders'),
    ('orders:create', 'Create orders'),
    ('orders:update', 'Edit orders'),
    ('orders:delete', 'Delete orders'),
    ('roles:read', 'View roles and permissions'),
    ('roles:manage', 'Create, edit and delete roles, and assign roles to users')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.roles (name, description, is_system, is_default) VALUES
    ('admin', 'Full access to everything', true, false),
    ('manager', 'Manages products, categories, suppliers and orders', false, false),
    ('viewer', 'Read-only access, given to newly registered accounts', false, true)
ON CONFLICT ((lower(name))) DO NOTHING;

-- admin always gets every permission: re-run this file after adding new permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM public.roles
CROSS JOIN public.permissions
WHERE roles.name = 'admin'
ON CONFLICT DO NOTHING;

-- starting permissions for the other roles; only applied to a role that has none yet,
-- so re-running this file doesn't undo changes made from the Roles page
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM (VALUES
    ('manager', 'users:read'),
    ('manager', 'products:read'),
    ('manager', 'products:create'),
    ('manager', 'products:update'),
    ('manager', 'products:delete'),
    ('manager', 'categories:read'),
    ('manager', 'categories:create'),
    ('manager', 'categories:update'),
    ('manager', 'categories:delete'),
    ('manager', 'suppliers:read'),
    ('manager', 'suppliers:create'),
    ('manager', 'suppliers:update'),
    ('manager', 'suppliers:delete'),
    ('manager', 'orders:read'),
    ('manager', 'orders:create'),
    ('manager', 'orders:update'),
    ('manager', 'orders:delete'),
    ('viewer', 'products:read'),
    ('viewer', 'categories:read'),
    ('viewer', 'suppliers:read'),
    ('viewer', 'orders:read')
) AS grants (role_name, permission_code)
JOIN public.roles ON roles.name = grants.role_name
JOIN public.permissions ON permissions.code = grants.permission_code
WHERE NOT EXISTS (
    SELECT 1 FROM public.role_permissions WHERE role_permissions.role_id = roles.id
)
ON CONFLICT DO NOTHING;

-- existing accounts get the default role, so nobody is locked out after the upgrade.
-- give someone admin with: npm run assign-role -- <email> admin
INSERT INTO public.user_roles (user_id, role_id)
SELECT users.id, roles.id
FROM public.users
JOIN public.roles ON roles.is_default
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_roles.user_id = users.id
);
