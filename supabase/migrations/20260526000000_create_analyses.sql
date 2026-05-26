-- Persistent storage of every completed analysis.
--
-- Powers:
--   * /history     — list a user's past analyses
--   * /r/[id]      — public, read-only share links
--   * cache layer  — skip the Gemini call when (app_id, country, source) was
--                    analyzed within the last 24h (any user); the requester
--                    still gets their own row with `cached_from` set so their
--                    history is intact and the original row is the source of
--                    truth for the AI payload
--
-- Quota interplay:
--   Cache hits do NOT consume quota. The route checks the cache before
--   invoking `consume_analysis_quota`, so repeated lookups for the same app
--   in the same day are free both for the user and for our Gemini bill.

create extension if not exists "pgcrypto";

create table if not exists public.analyses (
    id                 uuid        primary key default gen_random_uuid(),
    user_email         text        not null,

    -- request inputs
    app_id             text        not null,
    country            text        not null,
    source             text        not null,

    -- app metadata snapshot
    app_name           text        not null,
    app_icon           text        not null,
    last_updated       text        not null,
    installs           text        not null,
    score              numeric     not null,
    ratings            integer     not null,
    price              text        not null,
    free               boolean     not null,
    offers_iap         boolean     not null,

    -- AI payload
    top_complaints     jsonb       not null,
    feature_requests   jsonb       not null,
    sentiment_summary  text        not null,
    app_ideas          jsonb       not null,
    bad_reviews        jsonb       not null,

    -- cache lineage (null when this row triggered an actual Gemini call)
    cached_from        uuid        references public.analyses(id) on delete set null,

    created_at         timestamptz not null default now()
);

create index if not exists analyses_user_recent_idx
    on public.analyses (user_email, created_at desc);

create index if not exists analyses_cache_lookup_idx
    on public.analyses (app_id, country, source, created_at desc);

alter table public.analyses enable row level security;

-- All access goes through the service role from server routes, so we
-- intentionally do NOT add user-facing RLS policies. The route enforces
-- ownership before returning a row.
