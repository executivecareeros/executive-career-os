begin;

update public.world_country_registry
set canonical_name='Türkiye', aliases='["Turkey","Turkiye","Türkiye"]'::jsonb,
    region='EMEA', subregion='Western Asia', updated_at=now()
where code='TR';

with authority as (
  select workspace_id,identity_id from public.founder_bootstrap_audit_events order by occurred_at asc limit 1
), sources(provider_id,source_key,company_name,url,domain,industry,priority) as (values
  ('greenhouse','greenhouse:job-boards.greenhouse.io/xometryturkey','Xometry Türkiye','https://job-boards.greenhouse.io/xometryturkey','xometry.com','Manufacturing marketplace',20),
  ('greenhouse','greenhouse:job-boards.greenhouse.io/constructortech','Constructor TECH','https://job-boards.greenhouse.io/constructortech','constructor.tech','Education technology',22),
  ('greenhouse','greenhouse:job-boards.greenhouse.io/oliver','OLIVER Agency','https://job-boards.greenhouse.io/oliver','oliver.agency','Marketing services',22),
  ('smartrecruiters','smartrecruiters:careers.smartrecruiters.com/lostar','Lostar','https://careers.smartrecruiters.com/lostar','lostar.com.tr','Cybersecurity',24),
  ('smartrecruiters','smartrecruiters:careers.smartrecruiters.com/Digiterra','Digiterra','https://careers.smartrecruiters.com/Digiterra',null,null,26),
  ('smartrecruiters','smartrecruiters:careers.smartrecruiters.com/VusionGroupSA','VusionGroup','https://careers.smartrecruiters.com/VusionGroupSA','vusion.com','Retail technology',22),
  ('smartrecruiters','smartrecruiters:careers.smartrecruiters.com/CRENNO','CRENNO','https://careers.smartrecruiters.com/CRENNO','crenno.com','Technology services',26),
  ('smartrecruiters','smartrecruiters:careers.smartrecruiters.com/blockville','Blockville','https://careers.smartrecruiters.com/blockville',null,'Game technology',28)
)
insert into public.opportunity_provider_schedules(
  workspace_id,provider_id,source_key,enabled,priority,maximum_results,cadence_minutes,timezone,next_run_at,
  locator,filters,compliance_basis,rate_limit,created_by
)
select authority.workspace_id,sources.provider_id,sources.source_key,true,sources.priority,1000,720,'UTC',now(),
  jsonb_strip_nulls(jsonb_build_object('url',sources.url,'companyName',sources.company_name,
    'employerDomain',sources.domain,'country','Türkiye','operatingRegions',jsonb_build_array('Türkiye','EMEA'),
    'industry',sources.industry,'batchVersion','1.0')),
  '{"countries":[],"industries":[],"executiveLevels":[],"languages":[],"keywords":[],"exclusionKeywords":[]}'::jsonb,
  'Employer-published public opportunity source; approved provider catalog',
  '{"mode":"provider-policy","concurrency":6}'::jsonb,authority.identity_id
from authority cross join sources
on conflict(workspace_id,provider_id,source_key) do update set
  enabled=true, priority=least(opportunity_provider_schedules.priority,excluded.priority),
  next_run_at=least(coalesce(opportunity_provider_schedules.next_run_at,now()),now()),
  locator=opportunity_provider_schedules.locator||excluded.locator, updated_at=now();

commit;
