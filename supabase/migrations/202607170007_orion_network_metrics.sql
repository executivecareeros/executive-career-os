begin;

create or replace function public.get_orion_network_evidence(
  target_workspace uuid,
  observed_at timestamptz default now()
) returns jsonb
language sql
stable
security invoker
set search_path=public
as $$
with
authorized as (
  select auth.role()='service_role' or public.is_active_workspace_member(target_workspace) as allowed
),
canonical as (
  select o.*,
    coalesce(nullif(o.payload->>'lastObservedAt','')::timestamptz,o.updated_at,o.created_at) as observed,
    lower(concat_ws(' ',o.country,o.payload->>'country',o.payload->>'location')) as geography,
    lower(coalesce(o.title,o.payload->>'jobTitle','')) as normalized_title
  from public.opportunities o,authorized a
  where a.allowed and o.workspace_id=target_workspace
),
active as (
  select * from canonical
  where archived_at is null and coalesce(status,'') not in ('Archived','Closed','Rejected')
),
source_observations as (
  select distinct
    coalesce(source->>'id','unknown') as provider_id,
    coalesce(source->>'originalId',c.domain_id) as source_id
  from canonical c
  cross join lateral jsonb_array_elements(coalesce(c.payload->'sources','[]'::jsonb)) source
),
run_window as (
  select * from public.opportunity_provider_runs r,authorized a
  where a.allowed and r.workspace_id=target_workspace and r.started_at>=observed_at-interval '7 days'
),
providers as (
  select count(distinct s.provider_id)::int as active_count
  from public.opportunity_provider_schedules s,authorized a
  where a.allowed and s.workspace_id=target_workspace and s.enabled
),
employers as (
  select c.* from public.companies c,authorized a
  where a.allowed and c.workspace_id=target_workspace and c.archived_at is null
),
active_employers as (
  select distinct company_id from active where company_id is not null
),
regions(region,pattern) as (values
  ('worldwide-remote','(worldwide|global).*(remote)|remote.*(worldwide|global)'),
  ('united-kingdom','(united kingdom|\muk\M|england|scotland|wales|london)'),
  ('north-america','(united states|\musa\M|canada|mexico|americas)'),
  ('latin-america','(latin america|latam|brazil|argentina|chile|colombia|peru|uruguay)'),
  ('middle-east','(middle east|mena|saudi arabia|uae|united arab emirates|israel|qatar|kuwait|bahrain|oman|jordan)'),
  ('africa','(africa|south africa|nigeria|kenya|egypt|morocco|ghana)'),
  ('oceania','(australia|new zealand|oceania)'),
  ('asia','(asia|apac|china|india|japan|singapore|south korea|taiwan|indonesia|malaysia|philippines|thailand)'),
  ('europe','(europe|emea|european union|germany|france|ireland|netherlands|spain|italy|belgium|sweden|norway|denmark|finland|poland|turkey|türkiye)')
),
regional as (
  select r.region,
    count(distinct a.id)::int as active_opportunities,
    count(distinct a.company_id)::int as active_employers,
    count(distinct coalesce(source->>'id','unknown')) filter(where source is not null)::int as active_providers,
    count(distinct a.id) filter(where a.observed>=observed_at-interval '48 hours')::int as fresh_opportunities,
    count(distinct a.id) filter(where
      nullif(a.title,'') is not null and nullif(a.payload->>'companyName','') is not null
      and nullif(a.payload->>'location','') is not null and coalesce((a.payload->>'canonicalizationConfidence')::numeric,0)>=70
    )::int as quality_complete_opportunities
  from regions r
  left join active a on a.geography ~ r.pattern
  left join lateral jsonb_array_elements(coalesce(a.payload->'sources','[]'::jsonb)) source on true
  group by r.region
),
core as (
  select jsonb_build_object(
    'measuredAt',observed_at,
    'rawOpportunities',(select count(*) from source_observations),
    'canonicalOpportunities',(select count(*) from canonical),
    'activeCanonicalOpportunities',(select count(*) from active),
    'historicalOpportunities',(select count(*) from canonical)-(select count(*) from active),
    'executiveOpportunities',(select count(*) from active where normalized_title ~ '(chief|president|vice president|vp|director|head of|general manager|managing director|c-suite|executive)'),
    'employers',(select count(*) from employers),
    'verifiedEmployers',(select count(*) from employers where official_domain is not null and last_verified_at is not null and identity_confidence>=80),
    'employersWithActiveOpportunities',(select count(*) from active_employers),
    'countriesCovered',(select count(distinct country) from active where nullif(country,'') is not null and lower(country) not in ('unknown','not specified')),
    'providersActive',(select active_count from providers),
    'providerSuccessRate',coalesce((select round(100.0*count(*) filter(where status in ('completed','completed-with-warnings'))/nullif(count(*),0),1) from run_window),0),
    'opportunityFreshness',coalesce((select round(100.0*count(*) filter(where observed>=observed_at-interval '48 hours')/nullif(count(*),0),1) from active),0),
    'employerFreshness',coalesce((select round(100.0*count(*) filter(where last_observed_at>=observed_at-interval '7 days')/nullif(count(*),0),1) from employers),0),
    'duplicateRate',coalesce((select round(100.0*greatest(count(*)-(select count(*) from canonical),0)/nullif(count(*),0),1) from source_observations),0),
    'canonicalizationConfidence',coalesce((select round(avg((payload->>'canonicalizationConfidence')::numeric),1) from active where payload ? 'canonicalizationConfidence'),0),
    'employerConfidence',coalesce((select round(avg(identity_confidence),1) from employers),0),
    'opportunityConfidence',coalesce((select round(avg((payload->>'confidenceScore')::numeric),1) from active where payload ? 'confidenceScore'),0),
    'dailyOpportunityGrowth',(select count(*) from canonical where created_at>=observed_at-interval '24 hours'),
    'weeklyEmployerGrowth',(select count(*) from employers where created_at>=observed_at-interval '7 days'),
    'staleOpportunityRate',coalesce((select round(100.0*count(*) filter(where observed<observed_at-interval '48 hours')/nullif(count(*),0),1) from active),0),
    'applicationUrlCoverage',coalesce((select round(100.0*count(*) filter(where nullif(payload->>'sourceUrl','') is not null)/nullif(count(*),0),1) from active),0),
    'compensationCoverage',coalesce((select round(100.0*count(*) filter(where payload ? 'salaryMin' or payload ? 'salaryMax')/nullif(count(*),0),1) from active),0),
    'locationCoverage',coalesce((select round(100.0*count(*) filter(where nullif(payload->>'location','') is not null and lower(payload->>'location') not in ('unknown','not specified'))/nullif(count(*),0),1) from active),0),
    'industryCoverage',coalesce((select round(100.0*count(*) filter(where nullif(industry,'') is not null and lower(industry) not in ('unknown','not specified'))/nullif(count(*),0),1) from active),0)
  ) as metrics
)
select case when (select allowed from authorized)
  then jsonb_build_object(
    'version','orion-m1-metrics-v1',
    'metrics',(select metrics from core),
    'gociEvidence',(select coalesce(jsonb_agg(jsonb_build_object(
      'region',region,
      'activeOpportunities',active_opportunities,
      'activeEmployers',active_employers,
      'activeProviders',active_providers,
      'freshOpportunities',fresh_opportunities,
      'qualityCompleteOpportunities',quality_complete_opportunities
    ) order by region),'[]'::jsonb) from regional)
  )
  else null
end
$$;

revoke all on function public.get_orion_network_evidence(uuid,timestamptz) from public,anon;
grant execute on function public.get_orion_network_evidence(uuid,timestamptz) to authenticated,service_role;

comment on function public.get_orion_network_evidence(uuid,timestamptz) is
  'Workspace-isolated Orion M1 evidence. Returns canonical network metrics and profile-independent GOCI inputs.';

commit;
