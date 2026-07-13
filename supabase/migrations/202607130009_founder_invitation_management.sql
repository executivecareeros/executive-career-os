begin;

create unique index if not exists workspace_invitations_pending_email_unique
  on public.workspace_invitations(workspace_id,lower(invited_email))
  where status='Pending' and archived_at is null;

create or replace function public.create_beta_invitation(target_workspace uuid,target_email text,target_role text,expiry timestamptz)
returns table(invitation_id uuid,invite_token text) language plpgsql security definer set search_path=public,extensions as $$
declare actor uuid; raw_token text; new_id uuid:=gen_random_uuid(); normalized_email text:=lower(trim(target_email));
begin
  if not public.has_workspace_permission(target_workspace,'Invite Members') then raise exception 'Founder invitation permission required' using errcode='42501';end if;
  if normalized_email='' or normalized_email!~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'A valid invited email is required' using errcode='22023';end if;
  if expiry<=now() then raise exception 'Invitation expiry must be in the future' using errcode='22007';end if;
  if target_role<>'Executive' then raise exception 'Beta invitations may only create Executive access' using errcode='22023';end if;
  select id into actor from public.executive_identities where auth_user_id=auth.uid();
  update public.workspace_invitations set status='Expired',updated_at=now(),version=version+1
    where workspace_id=target_workspace and lower(invited_email)=normalized_email and status='Pending' and expires_at<=now();
  if exists(select 1 from public.workspace_invitations where workspace_id=target_workspace and lower(invited_email)=normalized_email and status='Pending' and archived_at is null) then
    raise exception 'A pending invitation already exists for this email' using errcode='23505';
  end if;
  raw_token:=encode(gen_random_bytes(32),'hex');
  insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest)
  values(new_id,target_workspace,normalized_email,target_role,'Pending',expiry,actor,encode(digest(raw_token,'sha256'),'hex'));
  insert into public.beta_invitation_audit_events(invitation_id,workspace_id,event_type,actor_identity_id) values(new_id,target_workspace,'Created',actor);
  return query select new_id,raw_token;
exception when unique_violation then
  raise exception 'A pending invitation already exists for this email' using errcode='23505';
end$$;

create or replace function public.list_beta_invitations(target_workspace uuid)
returns table(invitation_id uuid,invited_email text,intended_role text,invitation_status text,expires_at timestamptz,created_at timestamptz,accepted_at timestamptz,revoked_at timestamptz,created_by uuid)
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_workspace_permission(target_workspace,'Invite Members') then raise exception 'Founder invitation permission required' using errcode='42501';end if;
  update public.workspace_invitations i set status='Expired',updated_at=now(),version=i.version+1
    where i.workspace_id=target_workspace and i.status='Pending' and i.expires_at<=now();
  return query select i.id,i.invited_email,i.intended_role,i.status,i.expires_at,i.created_at,i.accepted_at,i.revoked_at,i.created_by
    from public.workspace_invitations i where i.workspace_id=target_workspace and i.archived_at is null order by i.created_at desc;
end$$;

create or replace function public.revoke_beta_invitation(target_invitation uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare found public.workspace_invitations%rowtype; actor uuid;
begin
  select * into found from public.workspace_invitations where id=target_invitation for update;
  if found.id is null then raise exception 'Invitation not found' using errcode='22023';end if;
  if not public.has_workspace_permission(found.workspace_id,'Invite Members') then raise exception 'Founder invitation permission required' using errcode='42501';end if;
  if found.status='Pending' and found.expires_at<=now() then
    update public.workspace_invitations set status='Expired',updated_at=now(),version=version+1 where id=found.id;
    raise exception 'Expired invitations cannot be revoked' using errcode='55000';
  end if;
  if found.status<>'Pending' then raise exception 'Only pending invitations can be revoked' using errcode='55000';end if;
  select id into actor from public.executive_identities where auth_user_id=auth.uid();
  update public.workspace_invitations set status='Revoked',revoked_at=now(),updated_at=now(),version=version+1 where id=found.id;
  insert into public.beta_invitation_audit_events(invitation_id,workspace_id,event_type,actor_identity_id) values(found.id,found.workspace_id,'Revoked',actor);
  return found.id;
end$$;

revoke all on function public.list_beta_invitations(uuid),public.revoke_beta_invitation(uuid) from public;
grant execute on function public.list_beta_invitations(uuid),public.revoke_beta_invitation(uuid) to authenticated;

commit;
