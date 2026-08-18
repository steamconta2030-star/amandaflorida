# Supabase setup — Amanda Florida

## 1. Create the project

Create a new Supabase project dedicated to Amanda Florida. Do not reuse the database or credentials from Amanda Cleaner.

## 2. Configure environment variables

Copy `.env.example` to `.env` locally and fill in:

- `SUPABASE_URL` and `VITE_SUPABASE_URL` with the project URL;
- `SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the publishable key;
- `SUPABASE_SERVICE_ROLE_KEY` with the server-side secret key.

The service-role key must only exist in the server environment. Never prefix it with `VITE_` and never expose it in browser code.

## 3. Apply migrations

Apply every SQL file from `supabase/migrations` in filename order. Before applying them, run:

```bash
npm run check:migrations
```

## 4. Configure authentication

In Supabase Authentication:

1. set the production Site URL;
2. add local and production redirect URLs;
3. enable email/password;
4. optionally enable Google and configure its OAuth credentials.

Google login now uses Supabase directly and no longer depends on the previous Lovable project.

## 5. Create the first administrator

1. create the administrator account through Supabase Authentication;
2. copy that account's user UUID;
3. open the `user_roles` table;
4. insert a row with that UUID and the `admin` role.

Administrator access is never granted automatically by a migration.

## 6. Validate

Test the following flows before production:

- customer sign-up and sign-in;
- Google sign-in, if enabled;
- administrator access;
- cleaner application and approval;
- booking creation and cancellation;
- cleaner job assignment;
- booking messages and ratings.
