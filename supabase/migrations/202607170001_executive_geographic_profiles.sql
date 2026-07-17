begin;

create table public.executive_geographic_profiles(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references public.executive_identities(id),
  version integer not null default 1 check(version > 0),
  unique(workspace_id, executive_identity_id)
);

alter table public.executive_geographic_profiles enable row level security;
create index executive_geographic_profiles_workspace_idx on public.executive_geographic_profiles(workspace_id);

create policy executive_geographic_profiles_self_read on public.executive_geographic_profiles
for select to authenticated using(
  public.is_active_workspace_member(workspace_id)
  and executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid())
);
create policy executive_geographic_profiles_self_insert on public.executive_geographic_profiles
for insert to authenticated with check(
  public.is_active_workspace_member(workspace_id)
  and executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid())
  and created_by=executive_identity_id
);
create policy executive_geographic_profiles_self_update on public.executive_geographic_profiles
for update to authenticated using(
  public.is_active_workspace_member(workspace_id)
  and executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid())
) with check(
  public.is_active_workspace_member(workspace_id)
  and executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid())
);

commit;
