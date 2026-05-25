create table if not exists public.analysis_usage (
    user_email   text        not null,
    usage_date   date        not null,
    usage_count  integer     not null default 0,
    updated_at   timestamptz not null default now(),
    primary key (user_email, usage_date)
);

alter table public.analysis_usage enable row level security;

create or replace function public.consume_analysis_quota(
    p_user_email text,
    p_max_count  integer
)
returns table (
    allowed     boolean,
    used        integer,
    remaining   integer,
    total       integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_today      date    := (now() at time zone 'utc')::date;
    v_used       integer;
begin
    insert into public.analysis_usage (user_email, usage_date, usage_count)
    values (p_user_email, v_today, 0)
    on conflict (user_email, usage_date) do nothing;

    update public.analysis_usage
       set usage_count = usage_count + 1,
           updated_at  = now()
     where user_email = p_user_email
       and usage_date = v_today
       and usage_count < p_max_count
    returning usage_count into v_used;

    if v_used is null then
        select usage_count
          into v_used
          from public.analysis_usage
         where user_email = p_user_email
           and usage_date = v_today;

        return query
            select false, v_used, 0, p_max_count;
    else
        return query
            select true, v_used, greatest(p_max_count - v_used, 0), p_max_count;
    end if;
end;
$$;

revoke all on function public.consume_analysis_quota(text, integer) from public;
grant execute on function public.consume_analysis_quota(text, integer) to service_role;
