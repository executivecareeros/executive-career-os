begin;

create table if not exists public.atlas_guidance_response_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  executive_identity_id uuid not null references public.executive_identities(id) on delete cascade,
  question_id text not null,
  question text not null,
  answer text not null,
  recorded_at timestamptz not null default now()
);

create index if not exists atlas_guidance_history_owner_time_idx
  on public.atlas_guidance_response_history(workspace_id, executive_identity_id, recorded_at desc);

create unique index if not exists atlas_guidance_history_version_idx
  on public.atlas_guidance_response_history(workspace_id, executive_identity_id, question_id, recorded_at);

insert into public.atlas_guidance_response_history(
  workspace_id, executive_identity_id, question_id, question, answer, recorded_at
)
select workspace_id, executive_identity_id, question_id, question, answer, updated_at
from public.atlas_guidance_responses current_response
where not exists (
  select 1 from public.atlas_guidance_response_history history
  where history.workspace_id = current_response.workspace_id
    and history.executive_identity_id = current_response.executive_identity_id
    and history.question_id = current_response.question_id
    and history.recorded_at = current_response.updated_at
);

alter table public.atlas_guidance_response_history enable row level security;
revoke all on public.atlas_guidance_response_history from public, anon;
grant select on public.atlas_guidance_response_history to authenticated;

drop policy if exists atlas_guidance_history_owner_select on public.atlas_guidance_response_history;
create policy atlas_guidance_history_owner_select
  on public.atlas_guidance_response_history
  for select to authenticated
  using (
    executive_identity_id = public.current_executive_identity_id()
    and public.is_active_workspace_member(workspace_id)
  );

create or replace function public.preserve_atlas_guidance_response()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' or old.answer is distinct from new.answer then
    insert into public.atlas_guidance_response_history(
      workspace_id, executive_identity_id, question_id, question, answer, recorded_at
    ) values (
      new.workspace_id, new.executive_identity_id, new.question_id, new.question, new.answer, new.updated_at
    );
  end if;
  return new;
end;
$$;

revoke all on function public.preserve_atlas_guidance_response() from public, anon, authenticated;

drop trigger if exists preserve_atlas_guidance_response_trigger on public.atlas_guidance_responses;
create trigger preserve_atlas_guidance_response_trigger
after insert or update on public.atlas_guidance_responses
for each row execute function public.preserve_atlas_guidance_response();

commit;
