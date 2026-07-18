begin;

update public.world_country_registry
set canonical_name='United Kingdom',aliases='["UK","Britain","Great Britain","Britain (UK)"]'::jsonb,updated_at=now()
where code='GB';

update public.world_country_registry
set aliases='["USA","United States of America","U.S.A."]'::jsonb,updated_at=now()
where code='US';

update public.world_country_registry
set canonical_name='South Korea',aliases='["Korea (South)","Republic of Korea"]'::jsonb,updated_at=now()
where code='KR';

update public.world_country_registry
set aliases='["Turkey","Turkiye","Türkiye"]'::jsonb,updated_at=now()
where code='TR';

create or replace function public.get_operational_coverage_summary(
  target_workspace uuid,
  observed_at timestamptz default now()
) returns jsonb
language sql stable security invoker set search_path=public
as $$
with authorized as (
  select auth.role()='service_role' or public.is_active_workspace_member(target_workspace) as allowed
), country_aliases as materialized (
  select code,lower(code) as label from public.world_country_registry
  union all select code,lower(canonical_name) from public.world_country_registry
  union all select code,lower(alias) from public.world_country_registry cross join lateral jsonb_array_elements_text(aliases) alias
), opportunity_base as materialized (
  select company_id,country,updated_at
  from public.opportunities opportunity,authorized access
  where access.allowed and opportunity.workspace_id=target_workspace and opportunity.archived_at is null
    and coalesce(opportunity.status,'') not in('Archived','Closed','Rejected')
), opportunity_summary as (
  select count(*)::int as canonical_opportunities,count(distinct company_id)::int as employers,
    count(*) filter(where updated_at>=observed_at-interval '48 hours')::int as fresh_opportunities
  from opportunity_base
), geography_summary as (
  select count(distinct aliases.code)::int as countries_represented,
    count(distinct lower(nullif(opportunity.country,''))) filter(where aliases.code is null)::int as unrecognized_location_labels
  from opportunity_base opportunity left join country_aliases aliases on aliases.label=lower(nullif(opportunity.country,''))
), provider_summary as (
  select provider_id,count(*)::int as attempts,
    count(*) filter(where status in('completed','completed-with-warnings'))::int as successes,
    count(*) filter(where status='failed')::int as failures,
    max(finished_at) filter(where status in('completed','completed-with-warnings')) as last_success
  from public.opportunity_provider_runs run,authorized access
  where access.allowed and run.workspace_id=target_workspace and run.started_at>=observed_at-interval '24 hours' group by provider_id
), queue_summary as (
  select status,count(*)::int as jobs from public.opportunity_provider_jobs job,authorized access
  where access.allowed and job.workspace_id=target_workspace and job.status in('queued','running','retrying','failed') group by status
), persistence_summary as (
  select count(*)::int as batches,coalesce(sum(record_count),0)::int as records,
    coalesce(sum(inserted_count),0)::int as inserted,coalesce(sum(updated_count),0)::int as updated
  from public.opportunity_persistence_batches batch,authorized access
  where access.allowed and batch.workspace_id=target_workspace and batch.created_at>=observed_at-interval '24 hours'
)
select case when(select allowed from authorized) then jsonb_build_object(
  'version','operational-coverage-summary-v2','measuredAt',observed_at,
  'canonicalOpportunities',(select canonical_opportunities from opportunity_summary),
  'employers',(select employers from opportunity_summary),
  'countriesRepresented',(select countries_represented from geography_summary),
  'unrecognizedLocationLabels',(select unrecognized_location_labels from geography_summary),
  'freshOpportunities',(select fresh_opportunities from opportunity_summary),
  'providers',(select coalesce(jsonb_agg(to_jsonb(provider_summary) order by provider_id),'[]'::jsonb) from provider_summary),
  'queue',(select coalesce(jsonb_object_agg(status,jobs),'{}'::jsonb) from queue_summary),
  'persistence',(select to_jsonb(persistence_summary) from persistence_summary)
) end
$$;

comment on function public.get_operational_coverage_summary(uuid,timestamptz) is 'Bounded scheduler telemetry with deterministic ISO country recognition and explicit unrecognized-location counts.';

commit;
