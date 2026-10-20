-- passwords for login (nullable, so existing users stay valid; they can't log in until they register)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash text;

-- one account per email, ignoring case
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON public.users (lower(email));
