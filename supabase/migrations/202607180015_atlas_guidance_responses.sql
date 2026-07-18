begin;

create table public.atlas_guidance_responses(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  executive_identity_id uuid not null references public.executive_identities(id) on delete cascade,
  question_id text not null check(char_length(question_id) between 3 and 200),
  question text not null check(char_length(question) between 3 and 1000),
  answer text not null check(char_length(answer) between 1 and 2000),
  answered_at timestamptz not null default now(),
  next_review_at timestamptz not null default now()+interval '30 days',
  updated_at timestamptz not null default now(),
  unique(workspace_id,executive_identity_id,question_id)
);
alter table public.atlas_guidance_responses enable row level security;
revoke all on public.atlas_guidance_responses from public,anon;
grant select,insert,update on public.atlas_guidance_responses to authenticated;
create policy atlas_guidance_responses_owner_select on public.atlas_guidance_responses for select to authenticated using(
  executive_identity_id=public.current_executive_identity_id() and public.is_active_workspace_member(workspace_id)
);
create policy atlas_guidance_responses_owner_insert on public.atlas_guidance_responses for insert to authenticated with check(
  executive_identity_id=public.current_executive_identity_id() and public.is_active_workspace_member(workspace_id)
);
create policy atlas_guidance_responses_owner_update on public.atlas_guidance_responses for update to authenticated using(
  executive_identity_id=public.current_executive_identity_id() and public.is_active_workspace_member(workspace_id)
) with check(
  executive_identity_id=public.current_executive_identity_id() and public.is_active_workspace_member(workspace_id)
);

commit;
