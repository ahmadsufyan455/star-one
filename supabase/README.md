# Supabase

Database schema lives under `migrations/` and is managed with the Supabase CLI.

## Apply migrations

**Option 1 — Supabase CLI (recommended)**

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option 2 — Manual**

Open the Supabase dashboard → SQL Editor → paste the contents of the migration file → run.

## Adding a new migration

```bash
supabase migration new <descriptive_name>
```

Migration filenames are `<UTC-timestamp>_<name>.sql`. Always commit them; never edit a migration after it has been applied to a shared environment.
