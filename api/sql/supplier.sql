CREATE TABLE IF NOT EXISTS public.supplier (
    supplier_id SERIAL PRIMARY KEY,
    name text NOT NULL UNIQUE,
    email text NOT NULL,
    phone text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- for databases where created_at was created as "time" (no date) and without a default
ALTER TABLE public.supplier
    ALTER COLUMN created_at TYPE timestamp with time zone USING CURRENT_DATE + created_at;
ALTER TABLE public.supplier ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- link products to suppliers (nullable, so existing products stay valid)
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS supplier_id integer REFERENCES public.supplier(supplier_id);
