-- Persistent storage of user-saved app ideas.
--
-- Powers the /ideas workspace. When a user clicks the bookmark on an idea
-- card in an analysis result, we copy the idea payload into this table so
-- it survives independent of the source analysis (history can be cleared,
-- saved ideas stay).
--
-- Lineage:
--   * analysis_id is set when saving so the workspace can show "from <App>".
--   * If the source analysis is deleted, analysis_id is nulled — the saved
--     idea remains intact because the AppIdea payload is denormalized.
--
-- Dedupe:
--   * A user cannot save the same (analysis_id, idea_index) twice. The
--     bookmark button toggles, so re-saving requires deleting first.

create type public.saved_idea_status as enum ('idea', 'building', 'shipped', 'skipped');

create table if not exists public.saved_ideas (
    id           uuid                       primary key default gen_random_uuid(),
    user_email   text                       not null,

    analysis_id  uuid                       references public.analyses(id) on delete set null,
    idea_index   integer                    not null,

    -- denormalized snapshot so the row is self-contained
    idea_payload jsonb                      not null,
    app_name     text                       not null,
    app_icon     text                       not null,

    notes        text                       not null default '',
    status       public.saved_idea_status   not null default 'idea',

    created_at   timestamptz                not null default now(),
    updated_at   timestamptz                not null default now()
);

create unique index if not exists saved_ideas_user_dedupe_idx
    on public.saved_ideas (user_email, analysis_id, idea_index)
    where analysis_id is not null;

create index if not exists saved_ideas_user_recent_idx
    on public.saved_ideas (user_email, created_at desc);

create index if not exists saved_ideas_status_idx
    on public.saved_ideas (user_email, status);

alter table public.saved_ideas enable row level security;

-- All access goes through the service role from server routes; RLS is on
-- but no user-facing policies are defined. The route enforces ownership.
