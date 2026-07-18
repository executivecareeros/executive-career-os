begin;

alter table public.executive_rooms
  add column access_mode text not null default 'Open'
  check(access_mode in ('Open','InvitationOnly'));
alter table public.executive_rooms add constraint executive_rooms_platform_open_check
  check(not platform_managed or access_mode='Open');

drop policy if exists open_rooms_verified_read on public.executive_rooms;
create policy open_rooms_verified_read on public.executive_rooms for select to authenticated
using(status='Active' and access_mode='Open' and public.current_executive_identity_id() is not null);

create table public.executive_room_join_links(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  token_digest bytea not null unique,
  status text not null default 'Active' check(status in ('Active','Revoked','Exhausted')),
  expires_at timestamptz not null,
  max_uses integer not null check(max_uses between 1 and 100),
  use_count integer not null default 0 check(use_count>=0 and use_count<=max_uses),
  created_by uuid not null references public.executive_identities(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
alter table public.executive_room_join_links enable row level security;
revoke all on public.executive_room_join_links from public,anon,authenticated;

alter table public.executive_room_moderation_events drop constraint executive_room_moderation_events_event_type_check;
alter table public.executive_room_moderation_events add constraint executive_room_moderation_events_event_type_check check(event_type in (
  'RoomCreated','MemberInvited','MemberJoined','MemberLeft','MessagePinned','MessageUnpinned','RoomArchived','AtlasInvoked',
  'PermanenceRequested','PermanenceApproved','PermanenceRejected','PlatformRoomJoined',
  'RoomInviteLinkCreated','RoomInviteLinkRedeemed','RoomInviteLinkRevoked'
));

create or replace function public.create_executive_room_v3(
  room_title text,room_topic text,room_short_purpose text,room_language text,room_access_mode text,
  permanence_request_reason text,requested_closes_at timestamptz default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; target_workspace uuid; new_room uuid; close_time timestamptz;
begin
  actor:=public.current_executive_identity_id();
  select m.workspace_id into target_workspace from workspace_memberships m where m.executive_identity_id=actor and m.status='Active' and m.archived_at is null order by m.created_at limit 1;
  if actor is null or target_workspace is null then raise exception 'An active verified executive workspace is required'; end if;
  if room_access_mode not in ('Open','InvitationOnly') then raise exception 'Choose Open or Invitation Only access'; end if;
  if char_length(trim(room_title)) not between 3 and 100 or char_length(trim(room_topic)) not between 10 and 600 then raise exception 'Room title or topic is outside the allowed length'; end if;
  if char_length(trim(room_short_purpose)) not between 10 and 180 then raise exception 'A short room purpose is required'; end if;
  if char_length(trim(room_language)) not between 2 and 80 then raise exception 'A room language is required'; end if;
  if char_length(trim(permanence_request_reason)) not between 20 and 600 then raise exception 'Explain why this room should become permanent'; end if;
  close_time:=coalesce(requested_closes_at,now()+interval '30 days');
  if close_time<=now() then raise exception 'Temporary rooms require a future closing time'; end if;
  insert into executive_rooms(workspace_id,title,topic,short_purpose,language_name,access_mode,is_temporary,closes_at,permanence_status,permanence_reason,permanence_requested_at,created_by)
  values(target_workspace,trim(room_title),trim(room_topic),trim(room_short_purpose),trim(room_language),room_access_mode,true,close_time,'PendingFounderApproval',trim(permanence_request_reason),now(),actor)
  returning id into new_room;
  insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(new_room,actor,'Owner',actor);
  insert into executive_room_permanence_decisions(room_id,decision,reason,actor_identity_id) values(new_room,'Requested',trim(permanence_request_reason),actor);
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata) values(new_room,'RoomCreated',actor,jsonb_build_object('language',trim(room_language),'accessMode',room_access_mode,'permanence','PendingFounderApproval'));
  return new_room;
end$$;

create or replace function public.join_executive_room(target_room uuid)
returns void language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id();
begin
  if actor is null then raise exception 'A verified executive identity is required'; end if;
  if not exists(select 1 from executive_rooms where id=target_room and status='Active' and access_mode='Open') then raise exception 'This room requires an invitation'; end if;
  insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(target_room,actor,'Participant',actor) on conflict(room_id,executive_identity_id) do update set status='Active',archived_at=null;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id) values(target_room,'PlatformRoomJoined',actor,actor);
end$$;

create or replace function public.create_room_join_link(target_room uuid,requested_expires_at timestamptz default null,requested_max_uses integer default 50)
returns text language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); token text; expiry timestamptz:=coalesce(requested_expires_at,now()+interval '7 days'); link_id uuid;
begin
  if not exists(select 1 from executive_room_memberships m join executive_rooms r on r.id=m.room_id where m.room_id=target_room and m.executive_identity_id=actor and m.role='Owner' and m.status='Active' and r.status='Active' and r.access_mode='InvitationOnly') then raise exception 'Only the owner of an active invitation-only room can create links'; end if;
  if expiry<=now() or expiry>now()+interval '30 days' then raise exception 'Invitation links must expire within 30 days'; end if;
  if requested_max_uses not between 1 and 100 then raise exception 'Invitation links allow 1 to 100 uses'; end if;
  token:=encode(gen_random_bytes(32),'hex');
  insert into executive_room_join_links(room_id,token_digest,expires_at,max_uses,created_by) values(target_room,digest(token,'sha256'),expiry,requested_max_uses,actor) returning id into link_id;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata) values(target_room,'RoomInviteLinkCreated',actor,jsonb_build_object('linkId',link_id,'expiresAt',expiry,'maxUses',requested_max_uses));
  return token;
end$$;

create or replace function public.redeem_room_join_link(invite_token text)
returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); link_record executive_room_join_links%rowtype;
begin
  if actor is null then raise exception 'Sign in with a verified executive account to join'; end if;
  select * into link_record from executive_room_join_links where token_digest=digest(invite_token,'sha256') and status='Active' for update;
  if link_record.id is null or link_record.expires_at<=now() or link_record.use_count>=link_record.max_uses then raise exception 'This invitation link is invalid or expired'; end if;
  if not exists(select 1 from executive_rooms where id=link_record.room_id and status='Active' and access_mode='InvitationOnly') then raise exception 'This room is not available'; end if;
  insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(link_record.room_id,actor,'Participant',link_record.created_by) on conflict(room_id,executive_identity_id) do update set status='Active',archived_at=null;
  update executive_room_join_links set use_count=use_count+1,status=case when use_count+1>=max_uses then 'Exhausted' else status end where id=link_record.id;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id,safe_metadata) values(link_record.room_id,'RoomInviteLinkRedeemed',actor,actor,jsonb_build_object('linkId',link_record.id));
  return link_record.room_id;
end$$;

create or replace function public.revoke_room_join_link(target_link uuid)
returns void language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); target_room uuid;
begin
  select l.room_id into target_room from executive_room_join_links l join executive_room_memberships m on m.room_id=l.room_id where l.id=target_link and m.executive_identity_id=actor and m.role='Owner' and m.status='Active';
  if target_room is null then raise exception 'Only the room owner can revoke this link'; end if;
  update executive_room_join_links set status='Revoked',revoked_at=now() where id=target_link and status='Active';
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata) values(target_room,'RoomInviteLinkRevoked',actor,jsonb_build_object('linkId',target_link));
end$$;

create or replace function public.list_room_join_links(target_room uuid)
returns table(id uuid,status text,expires_at timestamptz,max_uses integer,use_count integer,created_at timestamptz)
language sql stable security definer set search_path=public as $$
  select l.id,l.status,l.expires_at,l.max_uses,l.use_count,l.created_at from executive_room_join_links l
  where l.room_id=target_room and exists(select 1 from executive_room_memberships m where m.room_id=target_room and m.executive_identity_id=public.current_executive_identity_id() and m.role='Owner' and m.status='Active')
  order by l.created_at desc
$$;

revoke all on function public.create_executive_room_v3(text,text,text,text,text,text,timestamptz) from public,anon;
revoke all on function public.create_room_join_link(uuid,timestamptz,integer) from public,anon;
revoke all on function public.redeem_room_join_link(text) from public,anon;
revoke all on function public.revoke_room_join_link(uuid) from public,anon;
revoke all on function public.list_room_join_links(uuid) from public,anon;
grant execute on function public.create_executive_room_v3(text,text,text,text,text,text,timestamptz) to authenticated;
grant execute on function public.create_room_join_link(uuid,timestamptz,integer) to authenticated;
grant execute on function public.redeem_room_join_link(text) to authenticated;
grant execute on function public.revoke_room_join_link(uuid) to authenticated;
grant execute on function public.list_room_join_links(uuid) to authenticated;

commit;
