begin;

create or replace function public.claim_next_opportunity_provider_job(
  target_workspace uuid,
  worker_id text,
  available_before timestamptz,
  lease_seconds integer default 300
)
returns table(
  id uuid,
  provider_id text,
  status text,
  priority integer,
  attempt integer,
  maximum_attempts integer,
  requested_at timestamptz,
  available_at timestamptz,
  filters jsonb
)
language plpgsql
security invoker
set search_path=public
as $$
declare claimed_id uuid;
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'WORKSPACE_ACCESS_DENIED';
  end if;
  if lease_seconds < 30 or lease_seconds > 3600 then
    raise exception 'INVALID_LEASE_DURATION';
  end if;

  select job.id into claimed_id
  from public.opportunity_provider_jobs job
  where job.workspace_id=target_workspace
    and job.available_at<=available_before
    and (
      job.status in ('queued','retrying')
      or (job.status='running' and job.lease_expires_at<available_before)
    )
  order by job.priority asc,job.requested_at asc
  for update skip locked
  limit 1;

  if claimed_id is null then return; end if;

  return query
  update public.opportunity_provider_jobs job
  set status='running',
      attempt=job.attempt+1,
      lease_owner=worker_id,
      lease_expires_at=available_before+make_interval(secs=>lease_seconds),
      updated_at=available_before
  where job.id=claimed_id
  returning job.id,job.provider_id,job.status,job.priority,job.attempt,job.maximum_attempts,job.requested_at,job.available_at,job.filters;
end
$$;

revoke all on function public.claim_next_opportunity_provider_job(uuid,text,timestamptz,integer) from public,anon;
grant execute on function public.claim_next_opportunity_provider_job(uuid,text,timestamptz,integer) to authenticated,service_role;

comment on function public.claim_next_opportunity_provider_job(uuid,text,timestamptz,integer) is 'Atomically claims due provider work for an active workspace member or the isolated scheduler service role.';

commit;
