begin;

create or replace function public.get_global_coverage_intelligence(
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
), active as (
  select o.*,
    lower(coalesce(nullif(o.country,''),nullif(o.payload->>'country',''))) as normalized_country,
    lower(coalesce(nullif(o.industry,''),'unclassified')) as normalized_industry,
    lower(coalesce(o.title,o.payload->>'jobTitle','')) as normalized_title,
    lower(concat_ws(' ',o.payload->>'workArrangement',o.payload->>'location')) as remote_evidence,
    coalesce(nullif(o.payload->>'lastObservedAt','')::timestamptz,o.updated_at,o.created_at) as observed
  from public.opportunities o,authorized a
  where a.allowed and o.workspace_id=target_workspace and o.archived_at is null
    and coalesce(o.status,'') not in('Archived','Closed','Rejected')
), country_metrics as (
  select registry.code,registry.canonical_name,registry.region,registry.subregion,registry.currency_code,
    count(active.id)::int as opportunities,
    count(active.id) filter(where active.normalized_title~'(chief|president|vice president|vp|director|head of|general manager|managing director|c-suite|executive)')::int as executive_opportunities,
    count(active.id) filter(where active.normalized_title~'(sales|commercial|revenue|business development|go.to.market|partnership)')::int as commercial_opportunities,
    count(active.id) filter(where active.remote_evidence~'(remote|distributed|work from home)')::int as remote_opportunities,
    count(distinct active.company_id)::int as employers,
    max(active.observed) as last_refresh_at
  from public.world_country_registry registry
  left join active on active.normalized_country in(lower(registry.canonical_name),lower(registry.code))
    or exists(select 1 from jsonb_array_elements_text(registry.aliases) alias where active.normalized_country=lower(alias))
  group by registry.code,registry.canonical_name,registry.region,registry.subregion,registry.currency_code
), industries as (
  select normalized_industry as industry,count(*)::int as opportunities,count(distinct company_id)::int as employers,
    count(*) filter(where normalized_title~'(chief|president|vice president|vp|director|head of|general manager|managing director|c-suite|executive)')::int as executive_opportunities,
    count(*) filter(where normalized_title~'(sales|commercial|revenue|business development|go.to.market|partnership)')::int as commercial_opportunities,
    count(*) filter(where remote_evidence~'(remote|distributed|work from home)')::int as remote_opportunities,
    count(distinct normalized_country)::int as countries,
    round(100.0*count(*) filter(where observed>=observed_at-interval '48 hours')/nullif(count(*),0),1) as freshness
  from active group by normalized_industry
), provider_sources as (
  select coalesce(source->>'id','unknown') as provider_id,count(distinct opportunity.id)::int as opportunities
  from active opportunity cross join lateral jsonb_array_elements(coalesce(opportunity.payload->'sources','[]'::jsonb)) source
  group by coalesce(source->>'id','unknown')
), provider_runs as (
  select provider_id,count(*)::int as attempts,
    count(*) filter(where status in('completed','completed-with-warnings'))::int as successes,
    count(*) filter(where status='failed')::int as failures,max(started_at) as last_attempt,max(finished_at) filter(where status in('completed','completed-with-warnings')) as last_success,
    round(avg(duration_ms))::int as average_duration_ms
  from public.opportunity_provider_runs run,authorized a
  where a.allowed and run.workspace_id=target_workspace and run.started_at>=observed_at-interval '7 days'
  group by provider_id
), provider_schedules as (
  select provider_id,count(*) filter(where enabled)::int as employers,max(last_success_at) as schedule_last_success,max(last_failure_at) as schedule_last_failure
  from public.opportunity_provider_schedules schedule,authorized a
  where a.allowed and schedule.workspace_id=target_workspace group by provider_id
), providers as (
  select coalesce(schedule.provider_id,runs.provider_id,sources.provider_id) as provider_id,
    coalesce(schedule.employers,0) as employers,coalesce(sources.opportunities,0) as opportunities,
    coalesce(runs.attempts,0) as attempts,coalesce(runs.successes,0) as successes,coalesce(runs.failures,0) as failures,
    runs.last_attempt,coalesce(runs.last_success,schedule.schedule_last_success) as last_success,runs.average_duration_ms,
    case when coalesce(runs.failures,0)>0 and coalesce(runs.successes,0)=0 then 'Degraded'
      when coalesce(runs.successes,0)>0 then 'Healthy' else 'Unknown' end as status
  from provider_schedules schedule full join provider_runs runs using(provider_id) full join provider_sources sources using(provider_id)
), persistence as (
  select count(*)::int as batches,sum(record_count)::int as records,round(avg(record_count),1) as average_batch_size,
    round(avg(duration_ms))::int as average_batch_duration_ms,sum(inserted_count)::int as inserted,sum(updated_count)::int as updated
  from public.opportunity_persistence_batches batch,authorized a
  where a.allowed and batch.workspace_id=target_workspace and batch.created_at>=observed_at-interval '7 days'
)
select case when(select allowed from authorized) then jsonb_build_object(
  'version','global-coverage-intelligence-v1','measuredAt',observed_at,
  'countryStandard','ISO 3166-1 alpha-2','countriesRepresented',(select count(*) from country_metrics),
  'countriesWithOpportunities',(select count(*) from country_metrics where opportunities>0),
  'countries',(select jsonb_agg(to_jsonb(country_metrics) order by canonical_name) from country_metrics),
  'industries',(select jsonb_agg(to_jsonb(industries) order by opportunities desc,industry) from industries),
  'providers',(select coalesce(jsonb_agg(to_jsonb(providers) order by provider_id),'[]'::jsonb) from providers),
  'persistence',(select to_jsonb(persistence) from persistence)
) end
$$;

revoke all on function public.get_global_coverage_intelligence(uuid,timestamptz) from public,anon;
grant execute on function public.get_global_coverage_intelligence(uuid,timestamptz) to authenticated,service_role;

comment on function public.get_global_coverage_intelligence(uuid,timestamptz) is 'Deterministic country, industry, provider-health and batch-persistence evidence. Unknown fields remain unavailable.';

commit;
