begin;

create index if not exists opportunities_workspace_status_updated_active_idx
  on public.opportunities(workspace_id,status,updated_at desc)
  where archived_at is null;

create or replace function public.get_operational_coverage_summary(
  target_workspace uuid,
  observed_at timestamptz default now()
) returns jsonb
language sql
stable
security invoker
set search_path=public
as $$
with authorized as (
  select auth.role()='service_role' or public.is_active_workspace_member(target_workspace) as allowed
), opportunity_summary as (
  select count(*)::int as canonical_opportunities,
    count(distinct company_id)::int as employers,
    count(distinct lower(nullif(country,'')))::int as geographic_labels,
    count(*) filter(where updated_at>=observed_at-interval '48 hours')::int as fresh_opportunities
  from public.opportunities opportunity,authorized access
  where access.allowed and opportunity.workspace_id=target_workspace and opportunity.archived_at is null
    and coalesce(opportunity.status,'') not in('Archived','Closed','Rejected')
), provider_summary as (
  select provider_id,
    count(*)::int as attempts,
    count(*) filter(where status in('completed','completed-with-warnings'))::int as successes,
    count(*) filter(where status='failed')::int as failures,
    max(finished_at) filter(where status in('completed','completed-with-warnings')) as last_success
  from public.opportunity_provider_runs run,authorized access
  where access.allowed and run.workspace_id=target_workspace and run.started_at>=observed_at-interval '24 hours'
  group by provider_id
), queue_summary as (
  select status,count(*)::int as jobs
  from public.opportunity_provider_jobs job,authorized access
  where access.allowed and job.workspace_id=target_workspace and job.status in('queued','running','retrying','failed')
  group by status
), persistence_summary as (
  select count(*)::int as batches,coalesce(sum(record_count),0)::int as records,
    coalesce(sum(inserted_count),0)::int as inserted,coalesce(sum(updated_count),0)::int as updated
  from public.opportunity_persistence_batches batch,authorized access
  where access.allowed and batch.workspace_id=target_workspace and batch.created_at>=observed_at-interval '24 hours'
)
select case when(select allowed from authorized) then jsonb_build_object(
  'version','operational-coverage-summary-v1',
  'measuredAt',observed_at,
  'canonicalOpportunities',(select canonical_opportunities from opportunity_summary),
  'employers',(select employers from opportunity_summary),
  'geographicLabels',(select geographic_labels from opportunity_summary),
  'freshOpportunities',(select fresh_opportunities from opportunity_summary),
  'providers',(select coalesce(jsonb_agg(to_jsonb(provider_summary) order by provider_id),'[]'::jsonb) from provider_summary),
  'queue',(select coalesce(jsonb_object_agg(status,jobs),'{}'::jsonb) from queue_summary),
  'persistence',(select to_jsonb(persistence_summary) from persistence_summary)
) end
$$;

revoke all on function public.get_operational_coverage_summary(uuid,timestamptz) from public,anon;
grant execute on function public.get_operational_coverage_summary(uuid,timestamptz) to authenticated,service_role;

comment on function public.get_operational_coverage_summary(uuid,timestamptz) is 'Bounded scheduler telemetry. Geographic labels are deliberately not presented as verified country counts.';

commit;
