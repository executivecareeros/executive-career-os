begin;

alter table public.companies
  add column if not exists canonical_key text,
  add column if not exists aliases jsonb not null default '[]'::jsonb,
  add column if not exists official_domain text,
  add column if not exists careers_url text,
  add column if not exists ats_provider text,
  add column if not exists identity_confidence numeric not null default 0 check(identity_confidence between 0 and 100),
  add column if not exists first_discovered_at timestamptz,
  add column if not exists last_observed_at timestamptz,
  add column if not exists last_verified_at timestamptz;

create unique index if not exists companies_workspace_canonical_key_unique
  on public.companies(workspace_id,canonical_key)
  where archived_at is null and canonical_key is not null;
create index if not exists companies_workspace_domain_idx
  on public.companies(workspace_id,official_domain)
  where archived_at is null and official_domain is not null;

create table public.employer_source_observations(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  company_id uuid not null,
  provider_id text not null,
  source_employer_id text not null,
  source_url text,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  confidence numeric not null check(confidence between 0 and 100),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  constraint employer_source_company_workspace_fk foreign key(workspace_id,company_id)
    references public.companies(workspace_id,id),
  constraint employer_source_observation_unique unique(workspace_id,provider_id,source_employer_id)
);

create index employer_source_observations_company_idx
  on public.employer_source_observations(workspace_id,company_id,last_seen_at desc);

alter table public.employer_source_observations enable row level security;
create policy employer_source_observations_read on public.employer_source_observations
  for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy employer_source_observations_insert on public.employer_source_observations
  for insert to authenticated with check(public.is_active_workspace_member(workspace_id));
create policy employer_source_observations_update on public.employer_source_observations
  for update to authenticated using(public.is_active_workspace_member(workspace_id))
  with check(public.is_active_workspace_member(workspace_id));

create or replace function public.upsert_employer_observation(
  target_workspace uuid,
  actor_id uuid,
  target_canonical_key text,
  target_name text,
  target_domain text,
  target_website text,
  target_industry text,
  target_country text,
  target_ats_provider text,
  target_confidence numeric,
  target_provider_id text,
  target_source_employer_id text,
  target_source_url text,
  observed_at timestamptz,
  observation_payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security invoker
set search_path=public
as $$
declare
  company_uuid uuid;
  normalized_key text := nullif(lower(trim(target_canonical_key)), '');
  normalized_domain text := nullif(lower(regexp_replace(trim(coalesce(target_domain,'')), '^www\.', '')), '');
  bounded_confidence numeric := greatest(0,least(100,coalesce(target_confidence,0)));
begin
  if auth.role() <> 'service_role' and not public.is_active_workspace_member(target_workspace) then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;
  if normalized_key is null or nullif(trim(target_name),'') is null then
    raise exception 'Canonical employer key and name are required' using errcode='22023';
  end if;

  insert into public.companies(
    id,domain_id,workspace_id,payload,created_by,name,country,industry,
    canonical_key,aliases,official_domain,careers_url,ats_provider,identity_confidence,
    first_discovered_at,last_observed_at,last_verified_at
  ) values (
    gen_random_uuid(),'employer-' || encode(digest(normalized_key,'sha256'),'hex'),target_workspace,
    jsonb_strip_nulls(jsonb_build_object('website',target_website,'evidenceStatus',case when normalized_domain is not null then 'Confirmed' else 'Partial' end)),
    actor_id,trim(target_name),nullif(trim(coalesce(target_country,'')),''),nullif(trim(coalesce(target_industry,'')),''),
    normalized_key,jsonb_build_array(trim(target_name)),normalized_domain,target_website,target_ats_provider,bounded_confidence,
    observed_at,observed_at,case when normalized_domain is not null then observed_at else null end
  )
  on conflict (workspace_id,canonical_key) where archived_at is null and canonical_key is not null
  do update set
    name=excluded.name,
    aliases=(select jsonb_agg(distinct value) from jsonb_array_elements(companies.aliases || excluded.aliases)),
    official_domain=coalesce(companies.official_domain,excluded.official_domain),
    careers_url=coalesce(companies.careers_url,excluded.careers_url),
    ats_provider=coalesce(companies.ats_provider,excluded.ats_provider),
    country=coalesce(companies.country,excluded.country),
    industry=coalesce(companies.industry,excluded.industry),
    identity_confidence=greatest(companies.identity_confidence,excluded.identity_confidence),
    last_observed_at=greatest(companies.last_observed_at,excluded.last_observed_at),
    last_verified_at=coalesce(greatest(companies.last_verified_at,excluded.last_verified_at),companies.last_verified_at,excluded.last_verified_at),
    payload=companies.payload || excluded.payload,
    updated_at=now(),version=companies.version+1
  returning id into company_uuid;

  insert into public.employer_source_observations(
    workspace_id,company_id,provider_id,source_employer_id,source_url,
    first_seen_at,last_seen_at,confidence,payload,created_by
  ) values (
    target_workspace,company_uuid,target_provider_id,target_source_employer_id,target_source_url,
    observed_at,observed_at,bounded_confidence,coalesce(observation_payload,'{}'::jsonb),actor_id
  )
  on conflict(workspace_id,provider_id,source_employer_id)
  do update set company_id=excluded.company_id,source_url=coalesce(excluded.source_url,employer_source_observations.source_url),
    last_seen_at=greatest(employer_source_observations.last_seen_at,excluded.last_seen_at),
    confidence=greatest(employer_source_observations.confidence,excluded.confidence),
    payload=employer_source_observations.payload || excluded.payload,updated_at=now();

  return company_uuid;
end
$$;

revoke all on function public.upsert_employer_observation(uuid,uuid,text,text,text,text,text,text,text,numeric,text,text,text,timestamptz,jsonb) from public;
grant execute on function public.upsert_employer_observation(uuid,uuid,text,text,text,text,text,text,text,numeric,text,text,text,timestamptz,jsonb) to authenticated,service_role;

commit;
