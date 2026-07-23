begin;

create or replace function public.get_opportunity_candidates(
  target_workspace uuid,
  candidate_limit integer default 1000
) returns table(
  id uuid,
  domain_id text,
  company_id uuid,
  version integer,
  payload jsonb,
  updated_at timestamptz
)
language sql stable security invoker set search_path=public
as $$
  select opportunity.id, opportunity.domain_id, opportunity.company_id, opportunity.version,
    jsonb_strip_nulls(jsonb_build_object(
      'companyName',opportunity.payload->'companyName','companyInitials',opportunity.payload->'companyInitials',
      'companyLogo',opportunity.payload->'companyLogo','jobTitle',opportunity.payload->'jobTitle',
      'location',opportunity.payload->'location','country',opportunity.payload->'country',
      'workArrangement',opportunity.payload->'workArrangement','employmentType',opportunity.payload->'employmentType',
      'industry',opportunity.payload->'industry','industryClassification',opportunity.payload->'industryClassification',
      'companySize',opportunity.payload->'companySize','source',opportunity.payload->'source','sourceUrl',opportunity.payload->'sourceUrl',
      'publishedAt',opportunity.payload->'publishedAt','discoveredAt',opportunity.payload->'discoveredAt','lastObservedAt',opportunity.payload->'lastObservedAt',
      'salaryMin',opportunity.payload->'salaryMin','salaryMax',opportunity.payload->'salaryMax','salaryCurrency',opportunity.payload->'salaryCurrency',
      'salaryDisclosure',opportunity.payload->'salaryDisclosure','executiveFitScore',opportunity.payload->'executiveFitScore',
      'strategicOpportunityScore',opportunity.payload->'strategicOpportunityScore','overallScore',opportunity.payload->'overallScore',
      'confidenceScore',opportunity.payload->'confidenceScore','completenessScore',opportunity.payload->'completenessScore',
      'status',opportunity.payload->'status','priority',opportunity.payload->'priority','travelRequirement',opportunity.payload->'travelRequirement',
      'summary',to_jsonb(left(coalesce(opportunity.payload->>'summary',''),600)),
      'keyResponsibilities',opportunity.payload->'keyResponsibilities','requiredSkills',opportunity.payload->'requiredSkills',
      'matchingStrengths',opportunity.payload->'matchingStrengths','riskFlags',opportunity.payload->'riskFlags','exclusions',opportunity.payload->'exclusions'
    )), opportunity.updated_at
  from public.opportunities opportunity
  where (auth.role()='service_role' or public.is_active_workspace_member(target_workspace))
    and opportunity.workspace_id=target_workspace and opportunity.archived_at is null
    and opportunity.domain_id like 'discovered-%'
    and opportunity.status in('Discovered','Evaluating','Qualified','Ready to Apply','Applied','Interview')
  order by opportunity.updated_at desc
  limit greatest(1,least(coalesce(candidate_limit,1000),1000));
$$;

comment on function public.get_opportunity_candidates(uuid,integer) is
  'Workspace-authorized compact candidate feed. List summaries are bounded; full evidence remains on the canonical opportunity record.';
grant execute on function public.get_opportunity_candidates(uuid,integer) to authenticated,service_role;

commit;
