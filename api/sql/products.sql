CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
