begin;

alter table public.executive_room_moderation_events
  drop constraint executive_room_moderation_events_event_type_check;
alter table public.executive_room_moderation_events
  add constraint executive_room_moderation_events_event_type_check
  check(event_type in ('RoomCreated','MemberInvited','MemberJoined','MemberLeft','MessagePinned','MessageUnpinned','RoomArchived','AtlasInvoked','ConversationCleared'));

create or replace function public.clear_executive_room_conversation(target_room uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare
  actor uuid:=public.current_executive_identity_id();
  room_record public.executive_rooms%rowtype;
  cleared_count integer:=0;
begin
  if actor is null then raise exception 'Authenticated executive required'; end if;
  select * into room_record from public.executive_rooms where id=target_room for update;
  if room_record.id is null then raise exception 'Room is unavailable'; end if;
  if not public.has_room_role(target_room,array['Owner'])
    and not (room_record.platform_managed and public.is_configured_founder()) then
    raise exception 'Only the room owner or Founder may clear this conversation';
  end if;

  update public.executive_room_messages
    set archived_at=now()
    where room_id=target_room and archived_at is null;
  get diagnostics cleared_count=row_count;

  delete from public.executive_room_pins where room_id=target_room;
  delete from public.executive_room_bookmarks where room_id=target_room;
  insert into public.executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata)
    values(target_room,'ConversationCleared',actor,jsonb_build_object('messageCount',cleared_count));
  update public.executive_rooms set updated_at=now() where id=target_room;
  return cleared_count;
end
$$;

revoke all on function public.clear_executive_room_conversation(uuid) from public,anon;
grant execute on function public.clear_executive_room_conversation(uuid) to authenticated;

commit;
