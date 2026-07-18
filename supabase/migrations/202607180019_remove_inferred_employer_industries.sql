begin;

-- A role description can mention AI, payments, security, or another domain without
-- establishing the employer's industry. Remove only heuristic v1 classifications;
-- explicit provider metadata is preserved.
update public.opportunities
set industry = 'Not specified',
    payload = payload || jsonb_build_object(
      'industry', 'Not specified',
      'industryClassification', jsonb_build_object(
        'source', 'Unknown',
        'confidence', 0,
        'reason', 'No explicit provider industry metadata'
      )
    ),
    updated_at = now(),
    version = version + 1
where payload #>> '{industryClassification,source}' = 'Employer evidence';

update public.companies
set industry = null,
    payload = payload || jsonb_build_object(
      'industryClassification', jsonb_build_object(
        'source', 'Unknown',
        'confidence', 0,
        'reason', 'No explicit provider industry metadata'
      )
    ),
    updated_at = now(),
    version = version + 1
where payload #>> '{industryClassification,source}' = 'Employer evidence';

create or replace function public.refresh_employer_intelligence(target_workspace uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare company_count integer := 0; opportunity_count integer := 0;
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;

  with aggregates as (
    select c.id,
      count(o.id) active_count,
      count(o.id) filter(where coalesce(o.title,'') ~* '\m(chief|president|vice president|vp|director|head of|general manager|managing director|executive)\M') executive_count,
      count(o.id) filter(where concat_ws(' ',o.title,o.payload->>'summary') ~* '\m(sales|commercial|revenue|business development|partnership|growth)\M') commercial_count,
      jsonb_agg(distinct o.country) filter(where nullif(o.country,'') is not null and o.country not in ('Unknown','Not specified')) countries,
      jsonb_agg(distinct o.payload->>'location') filter(where nullif(o.payload->>'location','') is not null and o.payload->>'location' not in ('Unknown','Not specified')) locations,
      encode(extensions.digest(concat_ws('|',c.name,c.industry,c.country,c.official_domain,c.careers_url,c.last_observed_at::text,count(o.id)::text,max(o.updated_at)::text),'sha256'),'hex') fingerprint
    from public.companies c left join public.opportunities o on o.workspace_id=c.workspace_id and o.company_id=c.id and o.archived_at is null
    where c.workspace_id=target_workspace and c.archived_at is null group by c.id
  )
  update public.companies c set payload=c.payload||jsonb_build_object('intelligence',jsonb_build_object(
    'version','employer-intelligence-v2','fingerprint','employer-intelligence-v2:'||a.fingerprint,'activeOpportunities',a.active_count,
    'executiveOpportunities',a.executive_count,'commercialOpportunities',a.commercial_count,'countries',coalesce(a.countries,'[]'::jsonb),
    'hiringLocations',coalesce(a.locations,'[]'::jsonb),'source','Canonical employer and opportunity evidence','generatedAt',now())),updated_at=now(),version=c.version+1
  from aggregates a where c.id=a.id and coalesce(c.payload#>>'{intelligence,fingerprint}','') <> 'employer-intelligence-v2:'||a.fingerprint;

  return jsonb_build_object('companiesClassified',company_count,'opportunitiesClassified',opportunity_count,'aiTokens',0);
end $$;

revoke all on function public.refresh_employer_intelligence(uuid) from public;
grant execute on function public.refresh_employer_intelligence(uuid) to authenticated,service_role;

commit;
