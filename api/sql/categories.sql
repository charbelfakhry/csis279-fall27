CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- for databases where the table was created without these defaults
ALTER TABLE public.categories ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE public.categories ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
