begin;

create table public.company_intelligence_observations(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  company_id uuid not null,
  fingerprint text not null,
  source_url text not null,
  observed_at timestamptz not null,
  facts jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  constraint company_intelligence_company_workspace_fk foreign key(workspace_id,company_id) references public.companies(workspace_id,id),
  constraint company_intelligence_fingerprint_format check(fingerprint like 'official-company-facts-v1:%'),
  constraint company_intelligence_source_https check(source_url ~ '^https://[^[:space:]]+$'),
  constraint company_intelligence_facts_array check(jsonb_typeof(facts)='array' and jsonb_array_length(facts) between 1 and 50),
  constraint company_intelligence_observation_unique unique(workspace_id,company_id,fingerprint)
);

create index company_intelligence_observations_company_idx
  on public.company_intelligence_observations(workspace_id,company_id,observed_at desc);

alter table public.company_intelligence_observations enable row level security;
create policy company_intelligence_observations_read on public.company_intelligence_observations
  for select to authenticated using(public.is_active_workspace_member(workspace_id));

create trigger company_intelligence_observations_append_only
  before update or delete on public.company_intelligence_observations
  for each row execute function public.reject_append_only_mutation();

grant select, insert on public.company_intelligence_observations to service_role;
grant select, update on public.companies to service_role;

create or replace function public.persist_company_intelligence_observation(
  target_workspace uuid,
  target_company uuid,
  source_url text,
  observed_at timestamptz,
  target_fingerprint text,
  facts jsonb
) returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  company_row public.companies%rowtype;
  observation_created boolean := false;
  cache_changed boolean := false;
begin
  if current_user <> 'service_role' then
    raise exception 'Workspace access denied' using errcode='42501';
  end if;
  if source_url !~ '^https://[^[:space:]]+$' or target_fingerprint not like 'official-company-facts-v1:%' then
    raise exception 'Invalid company intelligence evidence identity' using errcode='22023';
  end if;
  if jsonb_typeof(facts) <> 'array' or jsonb_array_length(facts) < 1 or jsonb_array_length(facts) > 50 then
    raise exception 'Company intelligence facts must contain between 1 and 50 items' using errcode='22023';
  end if;
  if exists(select 1 from jsonb_array_elements(facts) fact where
    coalesce(fact->>'sourceUrl','') <> source_url or
    coalesce(fact->>'value','') = '' or
    coalesce(fact->>'field','') not in ('overview','industry','headquarters','companySize','productOrService') or
    coalesce(fact->>'confidence','') !~ '^[0-9]+([.][0-9]+)?$' or
    case when coalesce(fact->>'confidence','') ~ '^[0-9]+([.][0-9]+)?$' then (fact->>'confidence')::numeric not between 0 and 100 else false end
  ) then
    raise exception 'Company intelligence contains invalid or mixed-source facts' using errcode='22023';
  end if;

  select * into company_row from public.companies
    where id=target_company and workspace_id=target_workspace and archived_at is null
    for update;
  if not found then raise exception 'Company not found' using errcode='P0002'; end if;

  insert into public.company_intelligence_observations(workspace_id,company_id,fingerprint,source_url,observed_at,facts,created_by)
  values(target_workspace,target_company,target_fingerprint,source_url,observed_at,facts,company_row.created_by)
  on conflict(workspace_id,company_id,fingerprint) do nothing;
  observation_created := found;

  if coalesce(company_row.payload#>>'{companyIntelligence,fingerprint}','') <> target_fingerprint then
    update public.companies set
      payload=payload||jsonb_build_object('companyIntelligence',jsonb_build_object(
        'version','company-intelligence-v1','fingerprint',target_fingerprint,'sourceUrl',source_url,
        'observedAt',observed_at,'facts',facts
      )),
      updated_at=now(),version=version+1
    where id=target_company and workspace_id=target_workspace;
    cache_changed := true;
  end if;

  return jsonb_build_object('changed',cache_changed,'observationCreated',observation_created,'fingerprint',target_fingerprint);
end
$$;

revoke all on function public.persist_company_intelligence_observation(uuid,uuid,text,timestamptz,text,jsonb) from public;
grant execute on function public.persist_company_intelligence_observation(uuid,uuid,text,timestamptz,text,jsonb) to service_role;

commit;
