-- Read-only quota peek used by GET /api/quota.
--
-- Mirrors `consume_analysis_quota` shape but never increments. Returning
-- `allowed = used < max` lets the UI badge stay in sync with the limit
-- enforced server-side without consuming a slot just to render.

create or replace function public.peek_analysis_quota(
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
    v_today date    := (now() at time zone 'utc')::date;
    v_used  integer := 0;
begin
    select usage_count
      into v_used
      from public.analysis_usage
     where user_email = p_user_email
       and usage_date = v_today;

    if v_used is null then
        v_used := 0;
    end if;

    return query
        select v_used < p_max_count,
               v_used,
               greatest(p_max_count - v_used, 0),
               p_max_count;
end;
$$;

revoke all on function public.peek_analysis_quota(text, integer) from public;
grant execute on function public.peek_analysis_quota(text, integer) to service_role;
