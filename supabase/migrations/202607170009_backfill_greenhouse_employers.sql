begin;

create or replace function public.backfill_greenhouse_employers(
  target_workspace uuid,
  actor_id uuid,
  observed_at timestamptz default now()
) returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  employer record;
  company_uuid uuid;
  linked_count integer := 0;
  batch_count integer := 0;
  employer_count integer := 0;
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;

  for employer in
    with greenhouse as (
      select o.id,
        nullif(trim(o.payload->>'companyName'),'') company_name,
        lower((regexp_match(source->>'originalUrl','greenhouse\.io/([^/]+)/jobs'))[1]) board_token,
        source->>'originalUrl' source_url,
        coalesce((o.payload->>'canonicalizationConfidence')::numeric,0) confidence
      from public.opportunities o
      cross join lateral jsonb_array_elements(coalesce(o.payload->'sources','[]'::jsonb)) source
      where o.workspace_id=target_workspace and o.archived_at is null and source->>'id'='greenhouse'
    )
    select board_token,company_name,min(source_url) source_url,max(confidence) confidence
    from greenhouse
    where board_token is not null and company_name is not null
    group by board_token,company_name
  loop
    company_uuid := public.upsert_employer_observation(
      target_workspace,actor_id,'greenhouse:'||employer.board_token,employer.company_name,
      null,'https://job-boards.greenhouse.io/'||employer.board_token,null,null,'greenhouse',
      employer.confidence,'greenhouse',employer.board_token,employer.source_url,observed_at,
      jsonb_build_object('sourceKind','Employer','evidenceStatus','Partial','backfillVersion','greenhouse-employer-v1')
    );
    employer_count := employer_count+1;

    with updated as (
      update public.opportunities o
      set company_id=company_uuid,
        payload=jsonb_set(
          jsonb_set(o.payload,'{companyId}',to_jsonb(company_uuid::text),true),
          '{companyProfile}',coalesce(o.payload->'companyProfile','{}'::jsonb)||jsonb_build_object(
            'companyId',company_uuid::text,
            'canonicalKey','greenhouse:'||employer.board_token,
            'name',employer.company_name,
            'careersUrl','https://job-boards.greenhouse.io/'||employer.board_token,
            'evidenceStatus','Partial'
          ),true
        ),
        updated_at=observed_at,
        version=o.version+1
      where o.workspace_id=target_workspace and o.archived_at is null
        and exists (
          select 1 from jsonb_array_elements(coalesce(o.payload->'sources','[]'::jsonb)) source
          where source->>'id'='greenhouse'
            and lower((regexp_match(source->>'originalUrl','greenhouse\.io/([^/]+)/jobs'))[1])=employer.board_token
        )
      returning 1
    ) select count(*) into batch_count from updated;
    linked_count := linked_count+batch_count;
  end loop;

  return jsonb_build_object('version','greenhouse-employer-backfill-v1','employersResolved',employer_count,'opportunitiesLinked',linked_count,'observedAt',observed_at);
end
$$;

revoke all on function public.backfill_greenhouse_employers(uuid,uuid,timestamptz) from public,anon;
grant execute on function public.backfill_greenhouse_employers(uuid,uuid,timestamptz) to authenticated,service_role;

comment on function public.backfill_greenhouse_employers(uuid,uuid,timestamptz) is
  'Idempotently resolves existing workspace Greenhouse observations to canonical employers using explicit board provenance.';

commit;
