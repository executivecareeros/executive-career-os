begin;

create table public.global_employer_targets(
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  legal_name text not null,
  country_code text not null references public.world_country_registry(code),
  official_domain text,
  careers_url text,
  source_system text not null,
  evidence_url text not null,
  priority_score numeric not null default 0 check(priority_score between 0 and 100),
  rank_in_country integer check(rank_in_country between 1 and 1000),
  qualification_status text not null default 'candidate' check(qualification_status in ('candidate','qualified','scheduled','active','rejected','unavailable')),
  provider_id text,
  active_opportunities integer not null default 0 check(active_opportunities >= 0),
  last_qualified_at timestamptz,
  last_observed_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(country_code,source_system,source_id)
);

create unique index global_employer_targets_country_domain_unique
  on public.global_employer_targets(country_code,official_domain)
  where official_domain is not null;
create index global_employer_targets_qualification_queue_idx
  on public.global_employer_targets(qualification_status,priority_score desc,country_code,rank_in_country)
  where qualification_status in ('candidate','qualified');
create index global_employer_targets_country_rank_idx
  on public.global_employer_targets(country_code,rank_in_country)
  where rank_in_country is not null;

alter table public.global_employer_targets enable row level security;

comment on table public.global_employer_targets is
  'Service-controlled, evidence-backed target registry for the country-weighted 250,000-employer Opportunity Factory objective. Absence from this registry never means an employer does not exist.';
comment on column public.global_employer_targets.rank_in_country is
  'Deterministic acquisition priority within a country, never a claim about corporate quality or prestige.';

commit;

