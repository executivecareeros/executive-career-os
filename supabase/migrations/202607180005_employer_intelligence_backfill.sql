begin;

create or replace function public.refresh_employer_intelligence(target_workspace uuid)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare company_count integer := 0; opportunity_count integer := 0;
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;

  with evidence as (
    select c.id,
      lower(concat_ws(' ',c.name,c.payload->>'overview',string_agg(coalesce(o.payload->>'summary',''),' '))) text_value
    from public.companies c left join public.opportunities o on o.workspace_id=c.workspace_id and o.company_id=c.id and o.archived_at is null
    where c.workspace_id=target_workspace and c.archived_at is null and nullif(c.industry,'') is null
    group by c.id,c.name,c.payload
  ), classified as (
    select id, case
      when text_value ~ '(cybersecurity|cyber security|information security|identity security)' then 'Cybersecurity'
      when text_value ~ '(artificial intelligence|machine learning|generative ai|ai platform)' then 'Artificial Intelligence'
      when text_value ~ '(enterprise software|saas|cloud platform|software platform|developer platform)' then 'Enterprise Software'
      when text_value ~ '(financial services|fintech|banking|payments|insurance)' then 'Financial Services'
      when text_value ~ '(healthcare|health care|medtech|biotechnology|pharmaceutical)' then 'Healthcare'
      when text_value ~ '(telecommunications|telecom|connectivity|network operator)' then 'Telecommunications'
      when text_value ~ '(media technology|broadcast|streaming|entertainment)' then 'Media & Entertainment'
      when text_value ~ '(consulting|professional services|advisory services)' then 'Professional Services'
      when text_value ~ '(manufacturing|industrial automation|automotive|aerospace)' then 'Manufacturing'
      when text_value ~ '(retail|consumer goods|ecommerce|e-commerce)' then 'Retail & Consumer'
      when text_value ~ '(renewable energy|energy|utilities|oil and gas)' then 'Energy'
      when text_value ~ '(education technology|edtech|higher education|learning platform)' then 'Education'
    end industry, encode(extensions.digest(text_value,'sha256'),'hex') fingerprint from evidence
  ), changed as (
    update public.companies c set industry=x.industry,
      payload=c.payload||jsonb_build_object('industryClassification',jsonb_build_object('source','Employer evidence','confidence',80,'fingerprint','industry-v1:'||x.fingerprint)),updated_at=now(),version=c.version+1
    from classified x where c.id=x.id and x.industry is not null returning c.id
  ) select count(*) into company_count from changed;

  with changed as (
    update public.opportunities o set industry=c.industry,
      payload=o.payload||jsonb_build_object('industry',c.industry,'industryClassification',c.payload->'industryClassification'),updated_at=now(),version=o.version+1
    from public.companies c where o.workspace_id=target_workspace and o.company_id=c.id and o.archived_at is null
      and c.industry is not null and (nullif(o.industry,'') is null or o.industry in ('Not specified','Unknown')) returning o.id
  ) select count(*) into opportunity_count from changed;

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
    'version','employer-intelligence-v1','fingerprint','employer-intelligence-v1:'||a.fingerprint,'activeOpportunities',a.active_count,
    'executiveOpportunities',a.executive_count,'commercialOpportunities',a.commercial_count,'countries',coalesce(a.countries,'[]'::jsonb),
    'hiringLocations',coalesce(a.locations,'[]'::jsonb),'source','Canonical employer and opportunity evidence','generatedAt',now())),updated_at=now(),version=c.version+1
  from aggregates a where c.id=a.id and coalesce(c.payload#>>'{intelligence,fingerprint}','') <> 'employer-intelligence-v1:'||a.fingerprint;

  return jsonb_build_object('companiesClassified',company_count,'opportunitiesClassified',opportunity_count,'aiTokens',0);
end $$;

revoke all on function public.refresh_employer_intelligence(uuid) from public;
grant execute on function public.refresh_employer_intelligence(uuid) to authenticated,service_role;

commit;
