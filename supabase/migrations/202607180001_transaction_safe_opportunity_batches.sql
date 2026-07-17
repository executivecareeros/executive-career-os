begin;

create table public.opportunity_persistence_batches(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  batch_id text not null,
  provider_id text not null,
  collected_at timestamptz not null,
  record_count integer not null check(record_count between 1 and 250),
  inserted_count integer not null check(inserted_count >= 0),
  updated_count integer not null check(updated_count >= 0),
  duration_ms integer not null check(duration_ms >= 0),
  result jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  unique(workspace_id,batch_id)
);

create index opportunity_persistence_batches_provider_idx
  on public.opportunity_persistence_batches(workspace_id,provider_id,created_at desc);

alter table public.opportunity_persistence_batches enable row level security;
create policy opportunity_persistence_batches_read on public.opportunity_persistence_batches
  for select to authenticated using(public.is_active_workspace_member(workspace_id));

create or replace function public.persist_opportunity_batch(
  target_workspace uuid,
  actor_id uuid,
  target_batch_id text,
  target_provider_id text,
  collected_at timestamptz,
  items jsonb
) returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  started_at timestamptz := clock_timestamp();
  item_count integer;
  inserted_count integer;
  updated_count integer;
  result_payload jsonb;
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;
  if nullif(trim(target_batch_id),'') is null or nullif(trim(target_provider_id),'') is null then
    raise exception 'Batch and provider identity are required' using errcode='22023';
  end if;

  select result into result_payload
  from public.opportunity_persistence_batches
  where workspace_id=target_workspace and batch_id=target_batch_id;
  if found then return result_payload || jsonb_build_object('retrySafe',true); end if;

  if jsonb_typeof(items) <> 'array' then raise exception 'Batch items must be an array' using errcode='22023'; end if;
  item_count := jsonb_array_length(items);
  if item_count < 1 or item_count > 250 then raise exception 'Batch size must be between 1 and 250' using errcode='22023'; end if;
  if exists(
    select 1 from jsonb_array_elements(items) item
    where nullif(trim(item->>'domainId'),'') is null
       or nullif(trim(item->'company'->>'canonicalKey'),'') is null
       or nullif(trim(item->'company'->>'name'),'') is null
       or nullif(trim(item->>'title'),'') is null
       or jsonb_typeof(item->'payload') <> 'object'
  ) then raise exception 'Batch contains an invalid opportunity' using errcode='22023'; end if;

  select count(*) into updated_count
  from (
    select distinct on(candidate->>'domainId') candidate as item
    from jsonb_array_elements(items) candidate
    order by candidate->>'domainId'
  ) opportunity_batch
  join public.opportunities opportunity
    on opportunity.workspace_id=target_workspace
   and opportunity.domain_id=item->>'domainId';
  inserted_count := item_count-updated_count;

  insert into public.companies(
    id,domain_id,workspace_id,payload,created_by,name,country,industry,
    canonical_key,aliases,official_domain,careers_url,ats_provider,identity_confidence,
    first_discovered_at,last_observed_at,last_verified_at
  )
  select
    gen_random_uuid(),'employer-'||lower(trim(item->'company'->>'canonicalKey')),target_workspace,
    jsonb_strip_nulls(jsonb_build_object('website',item->'company'->>'website','evidenceStatus',coalesce(item->'company'->'observation'->>'evidenceStatus','Unknown'))),
    actor_id,trim(item->'company'->>'name'),nullif(trim(coalesce(item->'company'->>'country','')),''),nullif(trim(coalesce(item->'company'->>'industry','')),''),
    lower(trim(item->'company'->>'canonicalKey')),jsonb_build_array(trim(item->'company'->>'name')),
    nullif(lower(regexp_replace(trim(coalesce(item->'company'->>'domain','')),'^www\.','')),''),nullif(item->'company'->>'website',''),nullif(item->'company'->>'atsProvider',''),
    greatest(0,least(100,coalesce((item->'company'->>'confidence')::numeric,0))),
    (item->'company'->>'observedAt')::timestamptz,(item->'company'->>'observedAt')::timestamptz,
    case when nullif(item->'company'->>'domain','') is not null then (item->'company'->>'observedAt')::timestamptz end
  from (
    select distinct on(lower(trim(candidate->'company'->>'canonicalKey'))) candidate as item
    from jsonb_array_elements(items) candidate
    order by lower(trim(candidate->'company'->>'canonicalKey')),(candidate->'company'->>'observedAt')::timestamptz desc
  ) employer_batch
  on conflict(workspace_id,canonical_key) where archived_at is null and canonical_key is not null
  do update set
    name=excluded.name,
    aliases=(select jsonb_agg(distinct value) from jsonb_array_elements(companies.aliases||excluded.aliases)),
    official_domain=coalesce(companies.official_domain,excluded.official_domain),
    careers_url=coalesce(companies.careers_url,excluded.careers_url),
    ats_provider=coalesce(companies.ats_provider,excluded.ats_provider),
    country=coalesce(companies.country,excluded.country),industry=coalesce(companies.industry,excluded.industry),
    identity_confidence=greatest(companies.identity_confidence,excluded.identity_confidence),
    last_observed_at=greatest(companies.last_observed_at,excluded.last_observed_at),
    last_verified_at=coalesce(greatest(companies.last_verified_at,excluded.last_verified_at),companies.last_verified_at,excluded.last_verified_at),
    payload=companies.payload||excluded.payload,updated_at=now(),version=companies.version+1;

  insert into public.employer_source_observations(
    workspace_id,company_id,provider_id,source_employer_id,source_url,
    first_seen_at,last_seen_at,confidence,payload,created_by
  )
  select
    target_workspace,company.id,item->'company'->>'providerId',item->'company'->>'sourceEmployerId',nullif(item->'company'->>'sourceUrl',''),
    (item->'company'->>'observedAt')::timestamptz,(item->'company'->>'observedAt')::timestamptz,
    greatest(0,least(100,coalesce((item->'company'->>'confidence')::numeric,0))),coalesce(item->'company'->'observation','{}'::jsonb),actor_id
  from (
    select distinct on(candidate->'company'->>'providerId',candidate->'company'->>'sourceEmployerId') candidate as item
    from jsonb_array_elements(items) candidate
    order by candidate->'company'->>'providerId',candidate->'company'->>'sourceEmployerId',(candidate->'company'->>'observedAt')::timestamptz desc
  ) observation_batch
  join public.companies company on company.workspace_id=target_workspace
    and company.canonical_key=lower(trim(item->'company'->>'canonicalKey')) and company.archived_at is null
  on conflict(workspace_id,provider_id,source_employer_id)
  do update set company_id=excluded.company_id,source_url=coalesce(excluded.source_url,employer_source_observations.source_url),
    last_seen_at=greatest(employer_source_observations.last_seen_at,excluded.last_seen_at),
    confidence=greatest(employer_source_observations.confidence,excluded.confidence),
    payload=employer_source_observations.payload||excluded.payload,updated_at=now();

  with incoming_sources as (
    select item->>'domainId' as domain_id,source->>'id' as provider_id,coalesce(source->>'originalId','') as original_id
    from jsonb_array_elements(items) item
    cross join lateral jsonb_array_elements(coalesce(item->'payload'->'sources','[]'::jsonb)) source
  ), affected as (
    select opportunity.id,
      coalesce(jsonb_agg(source) filter(where not exists(
        select 1 from incoming_sources incoming
        where incoming.domain_id<>opportunity.domain_id and incoming.provider_id=source->>'id'
          and incoming.original_id=coalesce(source->>'originalId','')
      )),'[]'::jsonb) as retained_sources
    from public.opportunities opportunity
    cross join lateral jsonb_array_elements(coalesce(opportunity.payload->'sources','[]'::jsonb)) source
    where opportunity.workspace_id=target_workspace and opportunity.archived_at is null
      and exists(
        select 1 from incoming_sources incoming
        where incoming.domain_id<>opportunity.domain_id and incoming.provider_id=source->>'id'
          and incoming.original_id=coalesce(source->>'originalId','')
      )
    group by opportunity.id
  )
  update public.opportunities opportunity
  set payload=jsonb_set(opportunity.payload,'{sources}',affected.retained_sources),updated_at=now(),version=opportunity.version+1
  from affected where opportunity.id=affected.id;

  insert into public.opportunities(
    id,domain_id,workspace_id,company_id,title,country,industry,status,source_url,payload,created_by
  )
  select
    gen_random_uuid(),item->>'domainId',target_workspace,company.id,item->>'title',item->>'country',item->>'industry',item->>'status',nullif(item->>'sourceUrl',''),
    (item->'payload')||jsonb_build_object('companyId',company.id),actor_id
  from (
    select distinct on(candidate->>'domainId') candidate as item
    from jsonb_array_elements(items) candidate
    order by candidate->>'domainId'
  ) opportunity_batch
  join public.companies company on company.workspace_id=target_workspace
    and company.canonical_key=lower(trim(item->'company'->>'canonicalKey')) and company.archived_at is null
  on conflict(workspace_id,domain_id)
  do update set company_id=excluded.company_id,title=excluded.title,country=excluded.country,industry=excluded.industry,
    status=excluded.status,source_url=excluded.source_url,payload=excluded.payload,updated_at=now(),version=opportunities.version+1;

  result_payload := jsonb_build_object(
    'batchId',target_batch_id,'records',item_count,'inserted',inserted_count,'updated',updated_count,
    'databaseCalls',1,'durationMs',greatest(0,round(extract(epoch from(clock_timestamp()-started_at))*1000)::integer),'retrySafe',true
  );
  insert into public.opportunity_persistence_batches(
    workspace_id,batch_id,provider_id,collected_at,record_count,inserted_count,updated_count,duration_ms,result,created_by
  ) values(
    target_workspace,target_batch_id,target_provider_id,collected_at,item_count,inserted_count,updated_count,
    (result_payload->>'durationMs')::integer,result_payload,actor_id
  );
  return result_payload;
end
$$;

revoke all on function public.persist_opportunity_batch(uuid,uuid,text,text,timestamptz,jsonb) from public,anon;
grant execute on function public.persist_opportunity_batch(uuid,uuid,text,text,timestamptz,jsonb) to authenticated,service_role;

comment on table public.opportunity_persistence_batches is 'Idempotent transaction outcomes and low-cost batch persistence telemetry; contains no provider credentials or personal data.';
comment on function public.persist_opportunity_batch(uuid,uuid,text,text,timestamptz,jsonb) is 'Persists a bounded canonical opportunity batch atomically and returns retry-safe telemetry.';

commit;
