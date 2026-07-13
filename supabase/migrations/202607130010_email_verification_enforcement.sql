begin;

create table public.email_verification_audit_events(
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.workspace_invitations(id),
  workspace_id uuid not null references public.workspaces(id),
  auth_user_id uuid not null,
  event_type text not null check(event_type in('VerifiedInvitationAccepted')),
  occurred_at timestamptz not null default now(),
  safe_metadata jsonb not null default '{}'
);
do $$declare t text;begin foreach t in array array['email_verification_audit_events'] loop execute format('alter table public.%I enable row level security',t);end loop;end$$;
create policy email_verification_audit_founder_read on public.email_verification_audit_events for select to authenticated using(public.has_workspace_permission(workspace_id,'Invite Members'));
grant select on public.email_verification_audit_events to authenticated;
revoke all on public.email_verification_audit_events from anon;

create or replace function public.accept_beta_invitation(invite_token text)
returns uuid language plpgsql security definer set search_path=public,extensions,auth as $$
declare found public.workspace_invitations%rowtype; actor uuid:=auth.uid(); claimed_email text:=lower(coalesce(auth.jwt()->>'email',''));
begin
  if actor is null then raise exception 'Authentication required' using errcode='28000';end if;
  if not exists(select 1 from auth.users where id=actor and email_confirmed_at is not null) then raise exception 'Verified email required' using errcode='28000';end if;
  select * into found from public.workspace_invitations where token_digest=encode(digest(invite_token,'sha256'),'hex') for update;
  if found.id is null then raise exception 'Invalid invitation' using errcode='22023';end if;
  if found.status<>'Pending' then raise exception 'Invitation is not pending' using errcode='55000';end if;
  if found.expires_at<=now() then update public.workspace_invitations set status='Expired',updated_at=now(),version=version+1 where id=found.id;raise exception 'Invitation expired' using errcode='22007';end if;
  if claimed_email='' or claimed_email<>lower(found.invited_email) then raise exception 'Invitation email does not match authenticated identity' using errcode='42501';end if;
  update public.workspace_invitations set status='Accepted',accepted_at=now(),accepted_by_auth_user=actor,updated_at=now(),version=version+1 where id=found.id;
  insert into public.beta_invitation_audit_events(invitation_id,workspace_id,event_type,safe_metadata) values(found.id,found.workspace_id,'Accepted',jsonb_build_object('authUserId',actor));
  insert into public.email_verification_audit_events(invitation_id,workspace_id,auth_user_id,event_type) values(found.id,found.workspace_id,actor,'VerifiedInvitationAccepted');
  return found.id;
end$$;

create or replace function public.provision_invited_beta_workspace(onboarding jsonb)
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare ws uuid; identity uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000';end if;
  if not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Verified email required' using errcode='28000';end if;
  if not exists(select 1 from public.workspace_invitations where accepted_by_auth_user=auth.uid() and status='Accepted' and accepted_at is not null) then raise exception 'An accepted beta invitation is required' using errcode='42501';end if;
  ws:=public.provision_personal_workspace(onboarding);
  select id into identity from public.executive_identities where auth_user_id=auth.uid();
  insert into public.beta_workflow_states(domain_id,workspace_id,executive_identity_id,current_step,completed_steps)
  values('beta-workflow',ws,identity,'Professional History',array['Invitation','Registration','Verification','Onboarding'])
  on conflict(workspace_id,executive_identity_id) do nothing;
  return ws;
end$$;

revoke all on function public.accept_beta_invitation(text),public.provision_invited_beta_workspace(jsonb) from public;
grant execute on function public.accept_beta_invitation(text),public.provision_invited_beta_workspace(jsonb) to authenticated;

commit;
