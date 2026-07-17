begin;

create or replace function public.get_orion_employer_intelligence_coverage(
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
), employers as (
  select c.*
  from public.companies c, authorized a
  where a.allowed and c.workspace_id=target_workspace and c.archived_at is null and c.canonical_key is not null
), opportunity_counts as (
  select company_id,
    count(*) filter(where archived_at is null and coalesce(status,'') not in ('Archived','Closed','Rejected'))::int active_count,
    count(*) filter(where archived_at is null and coalesce(status,'') not in ('Archived','Closed','Rejected') and lower(coalesce(title,payload->>'jobTitle','')) ~ '(chief|president|vice president|vp|director|head of|general manager|managing director|executive)')::int executive_count
  from public.opportunities
  where workspace_id=target_workspace
  group by company_id
), evidence as (
  select e.id,
    (nullif(e.canonical_key,'') is not null and nullif(e.name,'') is not null) canonical_identity,
    exists(select 1 from public.employer_source_observations s where s.workspace_id=target_workspace and s.company_id=e.id and nullif(s.provider_id,'') is not null and nullif(s.source_employer_id,'') is not null) provider_identity,
    exists(select 1 from public.employer_source_observations s where s.workspace_id=target_workspace and s.company_id=e.id and nullif(s.source_url,'') is not null) provenance,
    jsonb_array_length(coalesce(e.aliases,'[]'::jsonb))>0 aliases,
    e.official_domain is not null official_domain,
    e.careers_url is not null careers_url,
    e.last_observed_at>=observed_at-interval '7 days' freshness,
    e.identity_confidence>0 confidence,
    coalesce(o.active_count,0)>0 active_opportunity_count,
    coalesce(o.executive_count,0)>=0 executive_opportunity_count,
    coalesce(o.active_count,0) active_count,
    coalesce(o.executive_count,0) executive_count
  from employers e left join opportunity_counts o on o.company_id=e.id
), scores as (
  select *,
    canonical_identity::int+provider_identity::int+provenance::int+aliases::int+freshness::int+confidence::int+active_opportunity_count::int+executive_opportunity_count::int registry_points,
    official_domain::int+careers_url::int extended_points
  from evidence
)
select case when (select allowed from authorized) then jsonb_build_object(
  'version','orion-employer-intelligence-v1',
  'measuredAt',observed_at,
  'employers',(select count(*) from scores),
  'opportunitiesLinked',(select coalesce(sum(active_count),0) from scores),
  'executiveOpportunitiesLinked',(select coalesce(sum(executive_count),0) from scores),
  'provenanceCoverage',coalesce((select round(100.0*count(*) filter(where provenance)/nullif(count(*),0),1) from scores),0),
  'confidenceCoverage',coalesce((select round(100.0*count(*) filter(where confidence)/nullif(count(*),0),1) from scores),0),
  'registryCoverage',coalesce((select round(100.0*sum(registry_points)/nullif(count(*)*8,0),1) from scores),0),
  'extendedIntelligenceCoverage',coalesce((select round(100.0*sum(registry_points+extended_points)/nullif(count(*)*10,0),1) from scores),0),
  'components',jsonb_build_object(
    'canonicalIdentity',(select count(*) from scores where canonical_identity),
    'providerIdentity',(select count(*) from scores where provider_identity),
    'provenance',(select count(*) from scores where provenance),
    'aliases',(select count(*) from scores where aliases),
    'officialDomain',(select count(*) from scores where official_domain),
    'careersUrl',(select count(*) from scores where careers_url),
    'freshness',(select count(*) from scores where freshness),
    'confidence',(select count(*) from scores where confidence),
    'activeOpportunityCount',(select count(*) from scores where active_opportunity_count),
    'executiveOpportunityCount',(select count(*) from scores where executive_opportunity_count)
  )
) else null end
$$;

revoke all on function public.get_orion_employer_intelligence_coverage(uuid,timestamptz) from public,anon;
grant execute on function public.get_orion_employer_intelligence_coverage(uuid,timestamptz) to authenticated,service_role;

comment on function public.get_orion_employer_intelligence_coverage(uuid,timestamptz) is
  'Versioned, workspace-isolated Orion M1A registry and extended employer intelligence coverage.';

commit;
