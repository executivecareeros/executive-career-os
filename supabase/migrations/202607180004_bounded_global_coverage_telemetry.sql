begin;

create index if not exists opportunities_workspace_country_active_idx
  on public.opportunities(workspace_id,lower(country)) where archived_at is null;
create index if not exists opportunities_workspace_industry_active_idx
  on public.opportunities(workspace_id,lower(industry)) where archived_at is null;

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
), active as materialized (
  select o.id,o.company_id,o.payload,o.title,o.country,o.industry,o.status,o.created_at,o.updated_at,
    lower(coalesce(nullif(o.country,''),nullif(o.payload->>'country',''))) as normalized_country,
    lower(coalesce(nullif(o.industry,''),'unclassified')) as normalized_industry,
    lower(coalesce(o.title,o.payload->>'jobTitle','')) as normalized_title,
    lower(concat_ws(' ',o.payload->>'workArrangement',o.payload->>'location')) as remote_evidence,
    coalesce(nullif(o.payload->>'lastObservedAt','')::timestamptz,o.updated_at,o.created_at) as observed
  from public.opportunities o,authorized a
  where a.allowed and o.workspace_id=target_workspace and o.archived_at is null
    and coalesce(o.status,'') not in('Archived','Closed','Rejected')
), country_aliases as materialized (
  select registry.code,lower(registry.canonical_name) as normalized_country from public.world_country_registry registry
  union all
  select registry.code,lower(alias) from public.world_country_registry registry
    cross join lateral jsonb_array_elements_text(registry.aliases) alias
), country_rollup as materialized (
  select normalized_country,count(*)::int as opportunities,
    count(*) filter(where normalized_title~'(chief|president|vice president|vp|director|head of|general manager|managing director|c-suite|executive)')::int as executive_opportunities,
    count(*) filter(where normalized_title~'(sales|commercial|revenue|business development|go.to.market|partnership)')::int as commercial_opportunities,
    count(*) filter(where remote_evidence~'(remote|distributed|work from home)')::int as remote_opportunities,
    count(distinct company_id)::int as employers,max(observed) as last_refresh_at
  from active where normalized_country is not null group by normalized_country
), resolved_country as materialized (
  select aliases.code,sum(rollup.opportunities)::int as opportunities,
    sum(rollup.executive_opportunities)::int as executive_opportunities,
    sum(rollup.commercial_opportunities)::int as commercial_opportunities,
    sum(rollup.remote_opportunities)::int as remote_opportunities,
    sum(rollup.employers)::int as employers,max(rollup.last_refresh_at) as last_refresh_at
  from country_rollup rollup join country_aliases aliases using(normalized_country) group by aliases.code
), country_metrics as (
  select registry.code,registry.canonical_name,registry.region,registry.subregion,registry.currency_code,
    coalesce(resolved.opportunities,0) as opportunities,
    coalesce(resolved.executive_opportunities,0) as executive_opportunities,
    coalesce(resolved.commercial_opportunities,0) as commercial_opportunities,
    coalesce(resolved.remote_opportunities,0) as remote_opportunities,
    coalesce(resolved.employers,0) as employers,resolved.last_refresh_at
  from public.world_country_registry registry left join resolved_country resolved using(code)
), industries as (
  select normalized_industry as industry,count(*)::int as opportunities,count(distinct company_id)::int as employers,
    count(*) filter(where normalized_title~'(chief|president|vice president|vp|director|head of|general manager|managing director|c-suite|executive)')::int as executive_opportunities,
    count(*) filter(where normalized_title~'(sales|commercial|revenue|business development|go.to.market|partnership)')::int as commercial_opportunities,
    count(*) filter(where remote_evidence~'(remote|distributed|work from home)')::int as remote_opportunities,
    count(distinct normalized_country)::int as countries,
    round(100.0*count(*) filter(where observed>=observed_at-interval '48 hours')/nullif(count(*),0),1) as freshness,
    case when normalized_industry in('unclassified','not specified','unknown') then 0 else 100 end as classification_confidence
  from active group by normalized_industry
), provider_sources as (
  select coalesce(source->>'id','unknown') as provider_id,count(distinct opportunity.id)::int as opportunities,
    count(*)::int as source_observations,
    round(100.0*greatest(count(*)-count(distinct opportunity.id),0)/nullif(count(*),0),1) as duplicate_rate,
    round(100.0*count(distinct opportunity.id) filter(where opportunity.observed>=observed_at-interval '48 hours')/nullif(count(distinct opportunity.id),0),1) as freshness
  from active opportunity cross join lateral jsonb_array_elements(coalesce(opportunity.payload->'sources','[]'::jsonb)) source
  group by coalesce(source->>'id','unknown')
), provider_runs as (
  select provider_id,count(*)::int as attempts,
    count(*) filter(where status in('completed','completed-with-warnings'))::int as successes,
    count(*) filter(where status='failed')::int as failures,max(started_at) as last_attempt,
    max(finished_at) filter(where status in('completed','completed-with-warnings')) as last_success,
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
    coalesce(sources.source_observations,0) as source_observations,coalesce(sources.duplicate_rate,0) as duplicate_rate,sources.freshness,
    coalesce(runs.attempts,0) as attempts,coalesce(runs.successes,0) as successes,coalesce(runs.failures,0) as failures,
    runs.last_attempt,coalesce(runs.last_success,schedule.schedule_last_success) as last_success,runs.average_duration_ms,
    case when coalesce(runs.failures,0)>0 and coalesce(runs.successes,0)=0 then 'Degraded'
      when coalesce(runs.successes,0)>0 then 'Healthy' else 'Unknown' end as status
  from provider_schedules schedule full join provider_runs runs using(provider_id) full join provider_sources sources using(provider_id)
), persistence as (
  select count(*)::int as batches,coalesce(sum(record_count),0)::int as records,round(avg(record_count),1) as average_batch_size,
    round(avg(duration_ms))::int as average_batch_duration_ms,coalesce(sum(inserted_count),0)::int as inserted,coalesce(sum(updated_count),0)::int as updated
  from public.opportunity_persistence_batches batch,authorized a
  where a.allowed and batch.workspace_id=target_workspace and batch.created_at>=observed_at-interval '7 days'
)
select case when(select allowed from authorized) then jsonb_build_object(
  'version','global-coverage-intelligence-v2','measuredAt',observed_at,
  'activeOpportunities',(select count(*) from active),
  'countryStandard','ISO 3166-1 alpha-2','countriesRepresented',(select count(*) from country_metrics),
  'countriesWithOpportunities',(select count(*) from country_metrics where opportunities>0),
  'countriesWithoutOpportunities',(select count(*) from country_metrics where opportunities=0),
  'countriesRefreshed',(select count(*) from country_metrics where last_refresh_at is not null),
  'registryCompleteness',100,
  'countryCoverageConfidence',(select round(100.0*least((select coalesce(sum(opportunities),0) from country_metrics),count(*))/nullif(count(*),0),1) from active),
  'countries',(select jsonb_agg(to_jsonb(country_metrics) order by canonical_name) from country_metrics),
  'industries',(select coalesce(jsonb_agg(to_jsonb(industries) order by opportunities desc,industry),'[]'::jsonb) from industries),
  'providers',(select coalesce(jsonb_agg(to_jsonb(providers) order by provider_id),'[]'::jsonb) from providers),
  'persistence',(select to_jsonb(persistence) from persistence)
) end
$$;

comment on function public.get_global_coverage_intelligence(uuid,timestamptz) is 'Bounded deterministic country, industry, provider-health and persistence telemetry; active opportunities are aggregated once.';

commit;
