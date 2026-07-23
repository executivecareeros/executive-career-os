begin;

create or replace function public.post_executive_room_message_v2(
  target_room uuid,message_body text,reply_to uuid default null,service_category text default null,service_city text default null,service_country text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); new_message uuid; room_record executive_rooms%rowtype; context jsonb:='{}';
begin
  if actor is null then raise exception 'Verified executive access required' using errcode='42501'; end if;
  select * into room_record from executive_rooms where id=target_room;
  if room_record.id is null or room_record.status<>'Active' then raise exception 'Room is unavailable'; end if;

  if not public.is_active_room_member(target_room) then
    if room_record.access_mode<>'Open' then raise exception 'This room requires an invitation'; end if;
    insert into executive_room_memberships(room_id,executive_identity_id,role,status,created_by)
    values(target_room,actor,'Participant','Active',actor)
    on conflict(room_id,executive_identity_id) do update set status='Active',role='Participant',left_at=null,archived_at=null;
    insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id)
    values(target_room,'PlatformRoomJoined',actor,actor);
  end if;

  if char_length(trim(message_body)) not between 1 and 4000 then raise exception 'Messages must contain 1 to 4000 characters'; end if;
  if reply_to is not null and not exists(select 1 from executive_room_messages where id=reply_to and room_id=target_room and archived_at is null) then raise exception 'Reply target is not available in this room'; end if;
  if room_record.room_type='ServiceMarketplace' and reply_to is null then
    if char_length(trim(coalesce(service_category,''))) not between 2 and 80 or char_length(trim(coalesce(service_city,''))) not between 2 and 100 or char_length(trim(coalesce(service_country,''))) not between 2 and 100 then raise exception 'Service category, city and country are required'; end if;
    context:=jsonb_build_object('serviceCategory',trim(service_category),'city',trim(service_city),'country',trim(service_country));
  end if;
  insert into executive_room_messages(room_id,parent_message_id,author_identity_id,body,structured_context)
  values(target_room,reply_to,actor,trim(message_body),context) returning id into new_message;
  update executive_rooms set updated_at=now() where id=target_room;
  return new_message;
end$$;

revoke all on function public.post_executive_room_message_v2(uuid,text,uuid,text,text,text) from public,anon;
grant execute on function public.post_executive_room_message_v2(uuid,text,uuid,text,text,text) to authenticated;

commit;
