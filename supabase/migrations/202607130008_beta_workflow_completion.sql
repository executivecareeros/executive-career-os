begin;

alter table public.atlas_reasoning_snapshots add constraint atlas_reasoning_snapshots_workspace_id_unique unique(workspace_id,id);
alter table public.executive_blueprint_revisions add constraint executive_blueprint_revisions_workspace_id_unique unique(workspace_id,id);

alter table public.workspace_invitations
  alter column invited_email set not null,
  add column if not exists token_digest text,
  add column if not exists accepted_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists accepted_by_auth_user uuid,
  add column if not exists last_validated_at timestamptz,
  add constraint workspace_invitations_status_check check(status in('Pending','Accepted','Expired','Revoked','Invalid')),
  add constraint workspace_invitations_token_digest_unique unique(token_digest),
  add constraint workspace_invitations_terminal_state_check check(
    (status='Accepted' and accepted_at is not null and accepted_by_auth_user is not null and revoked_at is null)
    or (status='Revoked' and revoked_at is not null and accepted_at is null)
    or (status in('Pending','Expired','Invalid') and accepted_at is null)
  );

create table public.beta_invitation_audit_events(
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.workspace_invitations(id),
  workspace_id uuid not null references public.workspaces(id),
  event_type text not null,
  safe_metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  actor_identity_id uuid references public.executive_identities(id)
);

create table public.beta_workflow_states(
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  current_step text not null,
  completed_steps text[] not null default '{}',
  active_import_session_id uuid,
  active_blueprint_revision_id uuid,
  active_opportunity_id uuid,
  active_reasoning_snapshot_id uuid,
  finalized_decision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check(version>0),
  unique(workspace_id,domain_id),
  unique(workspace_id,executive_identity_id),
  foreign key(workspace_id,active_import_session_id) references public.history_import_sessions(workspace_id,id),
  foreign key(workspace_id,active_blueprint_revision_id) references public.executive_blueprint_revisions(workspace_id,id),
  foreign key(workspace_id,active_opportunity_id) references public.opportunities(workspace_id,id),
  foreign key(workspace_id,active_reasoning_snapshot_id) references public.atlas_reasoning_snapshots(workspace_id,id)
);

create table public.beta_feedback(
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  route text not null,
  workflow_step text not null,
  category text not null check(category in('Bug','Confusion','Friction','Missing Information','Trust Concern','Incorrect Assessment','Useful Insight','Feature Request','Performance','Accessibility','Privacy','Security')),
  severity text not null check(severity in('Low','Medium','High','Critical')),
  description text not null check(length(trim(description)) between 1 and 5000),
  expected_behavior text,
  product_version text not null,
  screenshot_metadata jsonb,
  consent_to_follow_up boolean not null default false,
  status text not null default 'New' check(status in('New','Reviewing','Planned','Resolved','Won''t Fix','Needs Follow-up')),
  founder_notes text,
  triaged_at timestamptz,
  triaged_by uuid references public.executive_identities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check(version>0),
  unique(workspace_id,domain_id)
);

create table public.beta_lifecycle_requests(
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  request_type text not null check(request_type in('Export','Account Closure','Deletion','Consent Withdrawal')),
  status text not null default 'Submitted' check(status in('Submitted','Identity Verification Required','Reviewing','Approved','Partially Completed','Completed','Rejected','Cancelled')),
  retention_status text not null default 'Review Required',
  user_note text,
  founder_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.executive_identities(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check(version>0),
  unique(workspace_id,domain_id)
);

create unique index beta_lifecycle_active_request_unique on public.beta_lifecycle_requests(workspace_id,executive_identity_id,request_type) where status not in('Completed','Rejected','Cancelled');

create table public.beta_decision_commits(
  id uuid primary key default gen_random_uuid(),
  domain_id text not null,
  idempotency_key uuid not null,
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  blueprint_revision_id uuid not null,
  opportunity_id uuid not null,
  opportunity_version integer not null,
  reasoning_snapshot_id uuid not null,
  decision_snapshot_id uuid not null,
  ledger_entry_id uuid not null,
  task_id uuid not null,
  selected_action text not null check(selected_action in('Apply','Wait','Reject','Monitor','Negotiate','Network First')),
  committed_at timestamptz not null default now(),
  correlation_id uuid not null,
  foreign key(workspace_id,blueprint_revision_id) references public.executive_blueprint_revisions(workspace_id,id),
  foreign key(workspace_id,opportunity_id) references public.opportunities(workspace_id,id),
  foreign key(workspace_id,reasoning_snapshot_id) references public.atlas_reasoning_snapshots(workspace_id,id),
  foreign key(decision_snapshot_id) references public.atlas_decision_snapshots(id),
  foreign key(ledger_entry_id) references public.career_ledger_entries(id),
  foreign key(task_id) references public.executive_tasks(id),
  unique(workspace_id,domain_id),
  unique(workspace_id,idempotency_key),
  unique(workspace_id,reasoning_snapshot_id)
);

create table public.beta_workflow_audit_events(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  correlation_id uuid not null,
  safe_metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

do $$declare t text;begin foreach t in array array['beta_invitation_audit_events','beta_workflow_states','beta_feedback','beta_lifecycle_requests','beta_decision_commits','beta_workflow_audit_events'] loop execute format('alter table public.%I enable row level security',t);end loop;end$$;

create policy beta_workflow_states_member on public.beta_workflow_states for all to authenticated using(public.is_active_workspace_member(workspace_id)) with check(public.is_active_workspace_member(workspace_id));
create policy beta_feedback_self_read on public.beta_feedback for select to authenticated using(executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid()) or public.has_workspace_permission(workspace_id,'Manage Workspace'));
create policy beta_feedback_self_insert on public.beta_feedback for insert to authenticated with check(executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid()) and public.is_active_workspace_member(workspace_id));
create policy beta_feedback_founder_update on public.beta_feedback for update to authenticated using(public.has_workspace_permission(workspace_id,'Manage Workspace')) with check(public.has_workspace_permission(workspace_id,'Manage Workspace'));
create policy beta_lifecycle_self_read on public.beta_lifecycle_requests for select to authenticated using(executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid()) or public.has_workspace_permission(workspace_id,'Manage Workspace'));
create policy beta_lifecycle_self_insert on public.beta_lifecycle_requests for insert to authenticated with check(executive_identity_id=(select id from public.executive_identities where auth_user_id=auth.uid()) and public.is_active_workspace_member(workspace_id));
create policy beta_lifecycle_founder_update on public.beta_lifecycle_requests for update to authenticated using(public.has_workspace_permission(workspace_id,'Manage Workspace')) with check(public.has_workspace_permission(workspace_id,'Manage Workspace'));
create policy beta_decision_commits_member_read on public.beta_decision_commits for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy beta_workflow_audit_member_read on public.beta_workflow_audit_events for select to authenticated using(public.is_active_workspace_member(workspace_id));
create policy beta_invitation_audit_founder_read on public.beta_invitation_audit_events for select to authenticated using(public.has_workspace_permission(workspace_id,'Invite Members'));

grant select,insert,update on public.beta_workflow_states to authenticated;
grant select,insert on public.beta_feedback,public.beta_lifecycle_requests to authenticated;
grant update on public.beta_feedback,public.beta_lifecycle_requests to authenticated;
grant select on public.beta_decision_commits,public.beta_workflow_audit_events,public.beta_invitation_audit_events to authenticated;
revoke all on public.beta_invitation_audit_events,public.beta_workflow_states,public.beta_feedback,public.beta_lifecycle_requests,public.beta_decision_commits,public.beta_workflow_audit_events from anon;

create or replace function public.create_beta_invitation(target_workspace uuid,target_email text,target_role text,expiry timestamptz)
returns table(invitation_id uuid,invite_token text) language plpgsql security definer set search_path=public,extensions as $$
declare actor uuid; raw_token text; new_id uuid:=gen_random_uuid();
begin
  if not public.has_workspace_permission(target_workspace,'Invite Members') then raise exception 'Founder invitation permission required' using errcode='42501';end if;
  if expiry<=now() then raise exception 'Invitation expiry must be in the future' using errcode='22007';end if;
  select id into actor from public.executive_identities where auth_user_id=auth.uid();
  raw_token:=encode(gen_random_bytes(32),'hex');
  insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest)
  values(new_id,target_workspace,lower(trim(target_email)),target_role,'Pending',expiry,actor,encode(digest(raw_token,'sha256'),'hex'));
  insert into public.beta_invitation_audit_events(invitation_id,workspace_id,event_type,actor_identity_id) values(new_id,target_workspace,'Created',actor);
  return query select new_id,raw_token;
end$$;

create or replace function public.inspect_beta_invitation(target_email text,invite_token text)
returns table(invitation_id uuid,invitation_status text,expires_at timestamptz) language plpgsql security definer set search_path=public,extensions as $$
declare found public.workspace_invitations%rowtype;
begin
  select * into found from public.workspace_invitations where token_digest=encode(digest(invite_token,'sha256'),'hex') limit 1;
  if found.id is null or lower(trim(target_email))<>lower(found.invited_email) then return query select null::uuid,'Invalid'::text,null::timestamptz;return;end if;
  if found.status='Pending' and found.expires_at<=now() then update public.workspace_invitations set status='Expired',updated_at=now(),version=version+1 where id=found.id;found.status:='Expired';end if;
  update public.workspace_invitations set last_validated_at=now() where id=found.id;
  return query select found.id,found.status,found.expires_at;
end$$;

create or replace function public.accept_beta_invitation(invite_token text)
returns uuid language plpgsql security definer set search_path=public,extensions as $$
declare found public.workspace_invitations%rowtype; actor uuid:=auth.uid(); claimed_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin
  if actor is null then raise exception 'Authentication required' using errcode='28000';end if;
  select * into found from public.workspace_invitations where token_digest=encode(digest(invite_token,'sha256'),'hex') for update;
  if found.id is null then raise exception 'Invalid invitation' using errcode='22023';end if;
  if found.status<>'Pending' then raise exception 'Invitation is not pending' using errcode='55000';end if;
  if found.expires_at<=now() then update public.workspace_invitations set status='Expired',updated_at=now(),version=version+1 where id=found.id;raise exception 'Invitation expired' using errcode='22007';end if;
  if claimed_email='' or claimed_email<>lower(found.invited_email) then raise exception 'Invitation email does not match authenticated identity' using errcode='42501';end if;
  update public.workspace_invitations set status='Accepted',accepted_at=now(),accepted_by_auth_user=actor,updated_at=now(),version=version+1 where id=found.id;
  insert into public.beta_invitation_audit_events(invitation_id,workspace_id,event_type,safe_metadata) values(found.id,found.workspace_id,'Accepted',jsonb_build_object('authUserId',actor));
  return found.id;
end$$;

create or replace function public.finalize_beta_decision(request jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  ws uuid:=(request->>'workspaceId')::uuid; identity uuid; blueprint_revision uuid:=(request->>'blueprintRevisionId')::uuid;
  opportunity uuid:=(request->>'opportunityId')::uuid; reasoning uuid:=(request->>'reasoningSnapshotId')::uuid;
  idem uuid:=(request->>'idempotencyKey')::uuid; expected_version integer:=(request->>'opportunityVersion')::integer;
  selected text:=request->>'selectedAction'; correlation uuid:=gen_random_uuid(); existing uuid;
  decision_id uuid:=gen_random_uuid(); ledger_id uuid:=gen_random_uuid(); task_id uuid:=gen_random_uuid(); commit_id uuid:=gen_random_uuid(); next_sequence bigint;
begin
  if not public.is_active_workspace_member(ws) then raise exception 'Workspace access denied' using errcode='42501';end if;
  select id into identity from public.executive_identities where auth_user_id=auth.uid();
  select id into existing from public.beta_decision_commits where workspace_id=ws and idempotency_key=idem;if existing is not null then return existing;end if;
  if not exists(select 1 from public.executive_blueprint_revisions where workspace_id=ws and id=blueprint_revision) then raise exception 'Active Blueprint revision missing' using errcode='23503';end if;
  if not exists(select 1 from public.opportunities where workspace_id=ws and id=opportunity and version=expected_version and archived_at is null) then raise exception 'Opportunity version is stale or missing' using errcode='40001';end if;
  if not exists(select 1 from public.atlas_reasoning_snapshots where workspace_id=ws and id=reasoning and payload->>'blueprintRevisionId'=blueprint_revision::text and payload->>'opportunityId'=opportunity::text) then raise exception 'Reasoning input references do not match' using errcode='23503';end if;
  select coalesce(max(sequence_number),0)+1 into next_sequence from public.atlas_decision_snapshots where workspace_id=ws;
  insert into public.atlas_decision_snapshots(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by) values(decision_id,'beta-decision-'||idem,ws,next_sequence,now(),correlation,jsonb_build_object('selectedAction',selected,'reasoningSnapshotId',reasoning,'blueprintRevisionId',blueprint_revision,'opportunityId',opportunity),identity);
  select coalesce(max(sequence_number),0)+1 into next_sequence from public.career_ledger_entries where workspace_id=ws;
  insert into public.career_ledger_entries(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,causation_id,payload,created_by) values(ledger_id,'beta-decision-ledger-'||idem,ws,next_sequence,now(),correlation,decision_id,jsonb_build_object('eventType','Opportunity Decision Finalized','selectedAction',selected,'decisionSnapshotId',decision_id),identity);
  insert into public.executive_tasks(id,domain_id,workspace_id,title,priority,status,related_opportunity_id,related_decision_id,payload,created_by) values(task_id,'beta-next-action-'||idem,ws,selected||' — next action','High','Open',opportunity::text,decision_id::text,jsonb_build_object('source','Atomic beta decision finalization'),identity);
  insert into public.beta_decision_commits(id,domain_id,idempotency_key,workspace_id,executive_identity_id,blueprint_revision_id,opportunity_id,opportunity_version,reasoning_snapshot_id,decision_snapshot_id,ledger_entry_id,task_id,selected_action,correlation_id) values(commit_id,'beta-commit-'||idem,idem,ws,identity,blueprint_revision,opportunity,expected_version,reasoning,decision_id,ledger_id,task_id,selected,correlation);
  insert into public.beta_workflow_audit_events(workspace_id,executive_identity_id,event_type,subject_type,subject_id,correlation_id,safe_metadata) values(ws,identity,'DecisionFinalized','Opportunity',opportunity,correlation,jsonb_build_object('commitId',commit_id,'selectedAction',selected));
  update public.beta_workflow_states set finalized_decision_id=commit_id,current_step='Feedback',completed_steps=array_append(completed_steps,'Decision Finalized'),updated_at=now(),version=version+1 where workspace_id=ws and executive_identity_id=identity;
  return commit_id;
end$$;

create or replace function public.provision_invited_beta_workspace(onboarding jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare ws uuid; identity uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000';end if;
  if not exists(select 1 from public.workspace_invitations where accepted_by_auth_user=auth.uid() and status='Accepted' and accepted_at is not null) then raise exception 'An accepted beta invitation is required' using errcode='42501';end if;
  ws:=public.provision_personal_workspace(onboarding);
  select id into identity from public.executive_identities where auth_user_id=auth.uid();
  insert into public.beta_workflow_states(domain_id,workspace_id,executive_identity_id,current_step,completed_steps)
  values('beta-workflow',ws,identity,'Professional History',array['Invitation','Registration','Verification','Onboarding'])
  on conflict(workspace_id,executive_identity_id) do nothing;
  return ws;
end$$;

revoke execute on function public.provision_personal_workspace(jsonb) from authenticated;
revoke all on function public.create_beta_invitation(uuid,text,text,timestamptz),public.inspect_beta_invitation(text,text),public.accept_beta_invitation(text),public.finalize_beta_decision(jsonb),public.provision_invited_beta_workspace(jsonb) from public;
grant execute on function public.create_beta_invitation(uuid,text,text,timestamptz),public.accept_beta_invitation(text),public.finalize_beta_decision(jsonb),public.provision_invited_beta_workspace(jsonb) to authenticated;
grant execute on function public.inspect_beta_invitation(text,text) to anon,authenticated;

create index beta_feedback_workspace_status_idx on public.beta_feedback(workspace_id,status,created_at desc);
create index beta_lifecycle_workspace_status_idx on public.beta_lifecycle_requests(workspace_id,status,submitted_at desc);
create index beta_workflow_audit_workspace_time_idx on public.beta_workflow_audit_events(workspace_id,occurred_at desc);
create index beta_invitation_audit_invitation_time_idx on public.beta_invitation_audit_events(invitation_id,occurred_at);

commit;
