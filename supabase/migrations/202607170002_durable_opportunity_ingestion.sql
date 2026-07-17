begin;

create table public.opportunity_provider_schedules(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  provider_id text not null,
  source_key text not null,
  enabled boolean not null default false,
  priority integer not null default 100 check(priority > 0),
  maximum_results integer not null default 100 check(maximum_results > 0),
  cadence_minutes integer not null default 720 check(cadence_minutes >= 15),
  timezone text not null default 'UTC',
  next_run_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_discovery_validation_at timestamptz,
  locator jsonb not null default '{}',
  filters jsonb not null default '{"countries":[],"industries":[],"executiveLevels":[],"languages":[],"keywords":[],"exclusionKeywords":[]}',
  compliance_basis text not null,
  rate_limit jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  unique(workspace_id, provider_id, source_key)
);

create table public.opportunity_provider_jobs(
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id),
  schedule_id uuid references public.opportunity_provider_schedules(id),
  provider_id text not null,
  status text not null check(status in ('queued','running','completed','retrying','failed','cancelled')),
  priority integer not null check(priority > 0),
  attempt integer not null default 0 check(attempt >= 0),
  maximum_attempts integer not null check(maximum_attempts > 0),
  requested_at timestamptz not null,
  available_at timestamptz not null,
  filters jsonb not null,
  lease_owner text,
  lease_expires_at timestamptz,
  cancelled_at timestamptz,
  last_error jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id)
);

create table public.opportunity_provider_runs(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  job_id uuid not null references public.opportunity_provider_jobs(id),
  attempt integer not null check(attempt > 0),
  provider_id text not null,
  status text not null check(status in ('scheduled','running','completed','completed-with-warnings','failed','cancelled')),
  started_at timestamptz not null,
  finished_at timestamptz,
  duration_ms integer check(duration_ms is null or duration_ms >= 0),
  records_discovered integer not null default 0 check(records_discovered >= 0),
  records_changed integer not null default 0 check(records_changed >= 0),
  records_ignored integer not null default 0 check(records_ignored >= 0),
  records_deactivated integer not null default 0 check(records_deactivated >= 0),
  error_count integer not null default 0 check(error_count >= 0),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  unique(workspace_id, job_id, attempt)
);

create index opportunity_provider_schedules_due_idx on public.opportunity_provider_schedules(enabled,next_run_at) where enabled;
create index opportunity_provider_jobs_claim_idx on public.opportunity_provider_jobs(workspace_id,status,available_at,priority,requested_at) where status in ('queued','retrying','running');
create index opportunity_provider_jobs_schedule_idx on public.opportunity_provider_jobs(schedule_id,requested_at desc);
create index opportunity_provider_runs_workspace_started_idx on public.opportunity_provider_runs(workspace_id,started_at desc);
create index opportunity_provider_runs_provider_started_idx on public.opportunity_provider_runs(workspace_id,provider_id,started_at desc);

alter table public.opportunity_provider_schedules enable row level security;
alter table public.opportunity_provider_jobs enable row level security;
alter table public.opportunity_provider_runs enable row level security;

create policy opportunity_provider_schedules_read on public.opportunity_provider_schedules for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy opportunity_provider_schedules_insert on public.opportunity_provider_schedules for insert to authenticated with check(public.is_active_workspace_member(workspace_id));
create policy opportunity_provider_schedules_update on public.opportunity_provider_schedules for update to authenticated using(public.is_active_workspace_member(workspace_id)) with check(public.is_active_workspace_member(workspace_id));

create policy opportunity_provider_jobs_read on public.opportunity_provider_jobs for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy opportunity_provider_jobs_insert on public.opportunity_provider_jobs for insert to authenticated with check(public.is_active_workspace_member(workspace_id));
create policy opportunity_provider_jobs_update on public.opportunity_provider_jobs for update to authenticated using(public.is_active_workspace_member(workspace_id)) with check(public.is_active_workspace_member(workspace_id));

create policy opportunity_provider_runs_read on public.opportunity_provider_runs for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy opportunity_provider_runs_insert on public.opportunity_provider_runs for insert to authenticated with check(public.is_active_workspace_member(workspace_id));

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
  if not public.is_active_workspace_member(target_workspace) then
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
  order by job.priority asc, job.requested_at asc
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
grant execute on function public.claim_next_opportunity_provider_job(uuid,text,timestamptz,integer) to authenticated;

comment on table public.opportunity_provider_schedules is 'Durable, workspace-scoped provider and employer-source collection definitions.';
comment on table public.opportunity_provider_jobs is 'Persistent ingestion queue with retry, cancellation, and expiring concurrency leases.';
comment on table public.opportunity_provider_runs is 'Immutable attempt outcomes used for provider health and trustworthy inventory operations.';

commit;
