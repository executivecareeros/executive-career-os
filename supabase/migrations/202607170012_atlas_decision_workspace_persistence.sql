begin;

create table public.atlas_decision_workspace_events(
  id uuid primary key,
  domain_id text not null,
  workspace_id uuid not null references public.workspaces(id),
  opportunity_id uuid not null references public.opportunities(id),
  canonical_opportunity_id text not null,
  sequence_number bigint not null check(sequence_number>=1),
  event_type text not null check(event_type in ('Workspace Initialized','Stage Changed','Evidence Added','Evidence Reviewed','Task Added','Task Changed','Question Added','Question Completed','Note Added','Reassessment Completed','Decision Recorded')),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  correlation_id uuid not null,
  payload jsonb not null,
  created_by uuid not null references public.executive_identities(id),
  unique(workspace_id,domain_id),
  unique(workspace_id,opportunity_id,sequence_number)
);

alter table public.atlas_decision_workspace_events enable row level security;
create policy atlas_decision_workspace_events_read on public.atlas_decision_workspace_events for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy atlas_decision_workspace_events_insert on public.atlas_decision_workspace_events for insert to authenticated with check(public.is_active_workspace_member(workspace_id));
create trigger atlas_decision_workspace_events_append_only before update or delete on public.atlas_decision_workspace_events for each row execute function public.reject_append_only_mutation();
grant select,insert on public.atlas_decision_workspace_events to authenticated;
create index atlas_decision_workspace_events_current_idx on public.atlas_decision_workspace_events(workspace_id,opportunity_id,sequence_number desc);

create or replace function public.append_atlas_decision_workspace_event(request jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  ws uuid := (request->>'workspaceId')::uuid;
  target_opportunity uuid := (request->>'opportunityRowId')::uuid;
  canonical_id text := request->>'canonicalOpportunityId';
  expected_sequence bigint := coalesce((request->>'expectedSequence')::bigint,0);
  event_name text := request->>'eventType';
  snapshot jsonb := request->'workspace';
  occurred timestamptz := (request->>'occurredAt')::timestamptz;
  identity uuid;
  current_sequence bigint;
  previous_snapshot jsonb;
  event_id uuid := gen_random_uuid();
  correlation uuid := gen_random_uuid();
begin
  if not public.is_active_workspace_member(ws) then raise exception 'Workspace access denied' using errcode='42501'; end if;
  select id into identity from public.executive_identities where auth_user_id=auth.uid();
  if identity is null then raise exception 'Executive identity missing' using errcode='42501'; end if;
  if event_name not in ('Workspace Initialized','Stage Changed','Evidence Added','Evidence Reviewed','Task Added','Task Changed','Question Added','Question Completed','Note Added','Reassessment Completed','Decision Recorded') then raise exception 'Unsupported Atlas workspace event' using errcode='22023'; end if;
  if snapshot is null or snapshot->>'version'<>'atlas-decision-workspace-v1' or snapshot->>'opportunityId'<>canonical_id then raise exception 'Atlas workspace snapshot is invalid' using errcode='22023'; end if;
  if not exists(select 1 from public.opportunities where id=target_opportunity and workspace_id=ws and domain_id=canonical_id and archived_at is null) then raise exception 'Canonical opportunity missing' using errcode='23503'; end if;
  perform pg_advisory_xact_lock(hashtextextended(ws::text||target_opportunity::text,0));
  select coalesce(max(sequence_number),0) into current_sequence from public.atlas_decision_workspace_events where workspace_id=ws and opportunity_id=target_opportunity;
  if current_sequence<>expected_sequence then raise exception 'Atlas workspace is stale' using errcode='40001'; end if;
  if current_sequence>0 then
    select payload into previous_snapshot from public.atlas_decision_workspace_events where workspace_id=ws and opportunity_id=target_opportunity and sequence_number=current_sequence;
    if snapshot->>'id'<>previous_snapshot->>'id' or snapshot->>'createdAt'<>previous_snapshot->>'createdAt' then raise exception 'Atlas workspace identity is immutable' using errcode='22023'; end if;
    if not coalesce(snapshot->'reviews','[]'::jsonb) @> coalesce(previous_snapshot->'reviews','[]'::jsonb)
      or not coalesce(snapshot->'notes','[]'::jsonb) @> coalesce(previous_snapshot->'notes','[]'::jsonb)
      or not coalesce(snapshot->'reassessments','[]'::jsonb) @> coalesce(previous_snapshot->'reassessments','[]'::jsonb)
      or not coalesce(snapshot->'decisions','[]'::jsonb) @> coalesce(previous_snapshot->'decisions','[]'::jsonb)
      or not coalesce(snapshot->'timeline','[]'::jsonb) @> coalesce(previous_snapshot->'timeline','[]'::jsonb)
      or jsonb_array_length(coalesce(snapshot->'evidence','[]'::jsonb))<jsonb_array_length(coalesce(previous_snapshot->'evidence','[]'::jsonb))
      or jsonb_array_length(coalesce(snapshot->'tasks','[]'::jsonb))<jsonb_array_length(coalesce(previous_snapshot->'tasks','[]'::jsonb))
      or jsonb_array_length(coalesce(snapshot->'questions','[]'::jsonb))<jsonb_array_length(coalesce(previous_snapshot->'questions','[]'::jsonb))
    then raise exception 'Atlas workspace history cannot be rewritten or truncated' using errcode='22023'; end if;
  end if;
  insert into public.atlas_decision_workspace_events(id,domain_id,workspace_id,opportunity_id,canonical_opportunity_id,sequence_number,event_type,occurred_at,correlation_id,payload,created_by)
  values(event_id,'atlas-workspace-'||target_opportunity||'-'||(current_sequence+1),ws,target_opportunity,canonical_id,current_sequence+1,event_name,occurred,correlation,snapshot,identity);
  return jsonb_build_object('status','Recorded','sequence',current_sequence+1,'eventId',event_id);
end$$;

revoke all on function public.append_atlas_decision_workspace_event(jsonb) from public,anon;
grant execute on function public.append_atlas_decision_workspace_event(jsonb) to authenticated;
revoke delete,update on public.atlas_decision_workspace_events from authenticated;

commit;
