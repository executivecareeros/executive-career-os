begin;

create table public.executive_rooms(
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id),
  title text not null check(char_length(title) between 3 and 100),
  topic text not null check(char_length(topic) between 10 and 600),
  status text not null default 'Active' check(status in ('Active','Archived')),
  is_temporary boolean not null default false,
  closes_at timestamptz,
  retention_days integer not null default 90 check(retention_days between 1 and 90),
  created_by uuid not null references public.executive_identities(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check(not is_temporary or closes_at is not null)
);

create table public.executive_room_memberships(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  executive_identity_id uuid not null references public.executive_identities(id),
  role text not null check(role in ('Owner','Moderator','Participant')),
  status text not null default 'Active' check(status in ('Active','Left','Removed')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_by uuid not null references public.executive_identities(id),
  unique(room_id,executive_identity_id)
);

create table public.executive_room_invitations(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  intended_identity_id uuid not null references public.executive_identities(id),
  intended_role text not null default 'Participant' check(intended_role in ('Moderator','Participant')),
  status text not null default 'Pending' check(status in ('Pending','Accepted','Declined','Revoked','Expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by uuid not null references public.executive_identities(id),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique(room_id,intended_identity_id)
);

create table public.executive_room_messages(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  parent_message_id uuid references public.executive_room_messages(id),
  author_identity_id uuid not null references public.executive_identities(id),
  body text not null check(char_length(body) between 1 and 4000),
  message_kind text not null default 'Member' check(message_kind in ('Member','Atlas')),
  source_message_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  archived_at timestamptz
);

create table public.executive_room_pins(
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  message_id uuid not null references public.executive_room_messages(id) on delete cascade,
  created_by uuid not null references public.executive_identities(id),
  created_at timestamptz not null default now(),
  primary key(room_id,message_id)
);

create table public.executive_room_bookmarks(
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  message_id uuid not null references public.executive_room_messages(id) on delete cascade,
  executive_identity_id uuid not null references public.executive_identities(id),
  created_at timestamptz not null default now(),
  primary key(message_id,executive_identity_id)
);

create table public.executive_room_moderation_events(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  event_type text not null check(event_type in ('RoomCreated','MemberInvited','MemberJoined','MemberLeft','MessagePinned','MessageUnpinned','RoomArchived','AtlasInvoked')),
  actor_identity_id uuid not null references public.executive_identities(id),
  subject_identity_id uuid references public.executive_identities(id),
  message_id uuid references public.executive_room_messages(id),
  safe_metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create index executive_rooms_workspace_status_idx on public.executive_rooms(workspace_id,status,updated_at desc);
create index executive_room_memberships_identity_idx on public.executive_room_memberships(executive_identity_id,status,room_id);
create index executive_room_invitations_recipient_idx on public.executive_room_invitations(intended_identity_id,status,expires_at);
create index executive_room_messages_room_idx on public.executive_room_messages(room_id,created_at);
create index executive_room_moderation_room_idx on public.executive_room_moderation_events(room_id,occurred_at desc);

create function public.current_executive_identity_id() returns uuid language sql stable security definer set search_path=public as $$
  select id from executive_identities where auth_user_id=auth.uid() and status='Active' limit 1
$$;
create function public.is_active_room_member(target_room uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from executive_room_memberships m join executive_identities i on i.id=m.executive_identity_id where m.room_id=target_room and m.status='Active' and i.auth_user_id=auth.uid() and i.status='Active')
$$;
create function public.has_room_role(target_room uuid, allowed_roles text[]) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from executive_room_memberships m join executive_identities i on i.id=m.executive_identity_id where m.room_id=target_room and m.status='Active' and m.role=any(allowed_roles) and i.auth_user_id=auth.uid() and i.status='Active')
$$;

revoke all on function public.current_executive_identity_id() from public;
revoke all on function public.is_active_room_member(uuid) from public;
revoke all on function public.has_room_role(uuid,text[]) from public;
grant execute on function public.current_executive_identity_id() to authenticated;
grant execute on function public.is_active_room_member(uuid) to authenticated;
grant execute on function public.has_room_role(uuid,text[]) to authenticated;

alter table public.executive_rooms enable row level security;
alter table public.executive_room_memberships enable row level security;
alter table public.executive_room_invitations enable row level security;
alter table public.executive_room_messages enable row level security;
alter table public.executive_room_pins enable row level security;
alter table public.executive_room_bookmarks enable row level security;
alter table public.executive_room_moderation_events enable row level security;

create policy rooms_member_read on public.executive_rooms for select to authenticated using(public.is_active_room_member(id));
create policy memberships_member_read on public.executive_room_memberships for select to authenticated using(public.is_active_room_member(room_id));
create policy invitations_recipient_or_owner_read on public.executive_room_invitations for select to authenticated using(intended_identity_id=public.current_executive_identity_id() or public.has_room_role(room_id,array['Owner']));
create policy messages_member_read on public.executive_room_messages for select to authenticated using(public.is_active_room_member(room_id));
create policy pins_member_read on public.executive_room_pins for select to authenticated using(public.is_active_room_member(room_id));
create policy bookmarks_self_manage on public.executive_room_bookmarks for all to authenticated using(executive_identity_id=public.current_executive_identity_id() and public.is_active_room_member(room_id)) with check(executive_identity_id=public.current_executive_identity_id() and public.is_active_room_member(room_id));
create policy moderation_member_read on public.executive_room_moderation_events for select to authenticated using(public.is_active_room_member(room_id));

create function public.get_room_member_directory(target_room uuid) returns table(executive_identity_id uuid, display_name text, role text) language sql stable security definer set search_path=public as $$
  select m.executive_identity_id,
    coalesce(nullif(trim(coalesce(i.profile->>'fullName',i.profile->>'full_name',concat_ws(' ',i.profile->>'firstName',i.profile->>'lastName'))),''),'Verified executive') as display_name,
    m.role
  from executive_room_memberships m join executive_identities i on i.id=m.executive_identity_id
  where m.room_id=target_room and m.status='Active' and public.is_active_room_member(target_room)
  order by case m.role when 'Owner' then 1 when 'Moderator' then 2 else 3 end,m.joined_at
$$;
revoke all on function public.get_room_member_directory(uuid) from public;
grant execute on function public.get_room_member_directory(uuid) to authenticated;

create function public.create_executive_room(room_title text, room_topic text, temporary boolean default false, requested_closes_at timestamptz default null) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; target_workspace uuid; new_room uuid;
begin
  actor:=public.current_executive_identity_id();
  select m.workspace_id into target_workspace from workspace_memberships m where m.executive_identity_id=actor and m.status='Active' and m.archived_at is null order by m.created_at limit 1;
  if actor is null or target_workspace is null then raise exception 'An active verified executive workspace is required'; end if;
  if char_length(trim(room_title)) not between 3 and 100 or char_length(trim(room_topic)) not between 10 and 600 then raise exception 'Room title or topic is outside the allowed length'; end if;
  if temporary and (requested_closes_at is null or requested_closes_at<=now()) then raise exception 'Temporary rooms require a future closing time'; end if;
  insert into executive_rooms(workspace_id,title,topic,is_temporary,closes_at,created_by) values(target_workspace,trim(room_title),trim(room_topic),temporary,case when temporary then requested_closes_at else null end,actor) returning id into new_room;
  insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(new_room,actor,'Owner',actor);
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id) values(new_room,'RoomCreated',actor);
  return new_room;
end$$;

create function public.invite_verified_room_member(target_room uuid, recipient_email text, requested_role text default 'Participant') returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; recipient uuid; invitation uuid;
begin
  actor:=public.current_executive_identity_id();
  if not public.has_room_role(target_room,array['Owner']) then raise exception 'Only the room owner can invite members'; end if;
  if requested_role not in ('Moderator','Participant') then raise exception 'Invalid room role'; end if;
  select i.id into recipient from executive_identities i join auth.users u on u.id=i.auth_user_id
  where i.status='Active' and u.email_confirmed_at is not null and lower(u.email)=lower(trim(recipient_email)) limit 1;
  if recipient is null then raise exception 'No verified Orendalis executive account matches that email'; end if;
  if recipient=actor then raise exception 'The room owner is already a member'; end if;
  insert into executive_room_invitations(room_id,intended_identity_id,intended_role,created_by) values(target_room,recipient,requested_role,actor)
  on conflict(room_id,intended_identity_id) do update set intended_role=excluded.intended_role,status='Pending',expires_at=now()+interval '7 days',created_by=actor,created_at=now(),responded_at=null returning id into invitation;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id) values(target_room,'MemberInvited',actor,recipient);
  return invitation;
end$$;

create function public.respond_to_room_invitation(target_invitation uuid, accept_invitation boolean) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; invitation executive_room_invitations%rowtype;
begin
  actor:=public.current_executive_identity_id();
  select * into invitation from executive_room_invitations where id=target_invitation for update;
  if invitation.id is null or invitation.intended_identity_id<>actor then raise exception 'Invitation not available'; end if;
  if invitation.status<>'Pending' or invitation.expires_at<=now() then raise exception 'Invitation is no longer active'; end if;
  update executive_room_invitations set status=case when accept_invitation then 'Accepted' else 'Declined' end,responded_at=now() where id=target_invitation;
  if accept_invitation then
    insert into executive_room_memberships(room_id,executive_identity_id,role,status,created_by) values(invitation.room_id,actor,invitation.intended_role,'Active',invitation.created_by)
    on conflict(room_id,executive_identity_id) do update set role=excluded.role,status='Active',joined_at=now(),left_at=null;
    insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id) values(invitation.room_id,'MemberJoined',actor,actor);
  end if;
  return invitation.room_id;
end$$;

create function public.post_executive_room_message(target_room uuid, message_body text, reply_to uuid default null) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; new_message uuid; room_status text;
begin
  actor:=public.current_executive_identity_id();
  if not public.is_active_room_member(target_room) then raise exception 'Room not available'; end if;
  select status into room_status from executive_rooms where id=target_room;
  if room_status<>'Active' then raise exception 'Archived rooms are read only'; end if;
  if char_length(trim(message_body)) not between 1 and 4000 then raise exception 'Messages must contain 1 to 4000 characters'; end if;
  if reply_to is not null and not exists(select 1 from executive_room_messages where id=reply_to and room_id=target_room and archived_at is null) then raise exception 'Reply target is not available in this room'; end if;
  insert into executive_room_messages(room_id,parent_message_id,author_identity_id,body) values(target_room,reply_to,actor,trim(message_body)) returning id into new_message;
  update executive_rooms set updated_at=now() where id=target_room;
  return new_message;
end$$;

create function public.toggle_room_bookmark(target_room uuid, target_message uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare actor uuid;
begin
  actor:=public.current_executive_identity_id();
  if not public.is_active_room_member(target_room) or not exists(select 1 from executive_room_messages where id=target_message and room_id=target_room) then raise exception 'Message not available'; end if;
  if exists(select 1 from executive_room_bookmarks where message_id=target_message and executive_identity_id=actor) then delete from executive_room_bookmarks where message_id=target_message and executive_identity_id=actor; return false; end if;
  insert into executive_room_bookmarks(room_id,message_id,executive_identity_id) values(target_room,target_message,actor); return true;
end$$;

create function public.toggle_room_pin(target_room uuid, target_message uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare actor uuid;
begin
  actor:=public.current_executive_identity_id();
  if not public.has_room_role(target_room,array['Owner','Moderator']) then raise exception 'Only owners and moderators can pin messages'; end if;
  if not exists(select 1 from executive_room_messages where id=target_message and room_id=target_room) then raise exception 'Message not available'; end if;
  if exists(select 1 from executive_room_pins where room_id=target_room and message_id=target_message) then
    delete from executive_room_pins where room_id=target_room and message_id=target_message;
    insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,message_id) values(target_room,'MessageUnpinned',actor,target_message); return false;
  end if;
  insert into executive_room_pins(room_id,message_id,created_by) values(target_room,target_message,actor);
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,message_id) values(target_room,'MessagePinned',actor,target_message); return true;
end$$;

create function public.archive_executive_room(target_room uuid) returns void language plpgsql security definer set search_path=public as $$
declare actor uuid;
begin
  actor:=public.current_executive_identity_id();
  if not public.has_room_role(target_room,array['Owner']) then raise exception 'Only the room owner can archive this room'; end if;
  update executive_rooms set status='Archived',archived_at=now(),updated_at=now() where id=target_room and status='Active';
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id) values(target_room,'RoomArchived',actor);
end$$;

create function public.invoke_room_atlas(target_room uuid, request_text text) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; new_message uuid; recent_sources uuid[];
begin
  actor:=public.current_executive_identity_id();
  if not public.is_active_room_member(target_room) then raise exception 'Room not available'; end if;
  if char_length(trim(request_text)) not between 3 and 500 then raise exception 'Atlas requests must contain 3 to 500 characters'; end if;
  select coalesce(array_agg(id order by created_at),'{}') into recent_sources from (select id,created_at from executive_room_messages where room_id=target_room and archived_at is null order by created_at desc limit 20) source;
  insert into executive_room_messages(room_id,author_identity_id,body,message_kind,source_message_ids) values(target_room,actor,'Atlas request recorded. A source-preserving room summary will use only the messages cited in this request. Ambient monitoring is disabled.','Atlas',recent_sources) returning id into new_message;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,message_id,safe_metadata) values(target_room,'AtlasInvoked',actor,new_message,jsonb_build_object('requestLength',char_length(trim(request_text)),'sourceCount',coalesce(cardinality(recent_sources),0)));
  return new_message;
end$$;

revoke all on function public.create_executive_room(text,text,boolean,timestamptz) from public;
revoke all on function public.invite_verified_room_member(uuid,text,text) from public;
revoke all on function public.respond_to_room_invitation(uuid,boolean) from public;
revoke all on function public.post_executive_room_message(uuid,text,uuid) from public;
revoke all on function public.toggle_room_bookmark(uuid,uuid) from public;
revoke all on function public.toggle_room_pin(uuid,uuid) from public;
revoke all on function public.archive_executive_room(uuid) from public;
revoke all on function public.invoke_room_atlas(uuid,text) from public;
grant execute on function public.create_executive_room(text,text,boolean,timestamptz) to authenticated;
grant execute on function public.invite_verified_room_member(uuid,text,text) to authenticated;
grant execute on function public.respond_to_room_invitation(uuid,boolean) to authenticated;
grant execute on function public.post_executive_room_message(uuid,text,uuid) to authenticated;
grant execute on function public.toggle_room_bookmark(uuid,uuid) to authenticated;
grant execute on function public.toggle_room_pin(uuid,uuid) to authenticated;
grant execute on function public.archive_executive_room(uuid) to authenticated;
grant execute on function public.invoke_room_atlas(uuid,text) to authenticated;

create trigger executive_room_moderation_events_append_only before update or delete on public.executive_room_moderation_events for each row execute function public.reject_append_only_mutation();

commit;
