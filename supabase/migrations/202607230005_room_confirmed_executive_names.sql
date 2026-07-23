begin;

create or replace function public.room_confirmed_executive_name(target_identity uuid)
returns text language plpgsql stable security definer set search_path=public as $$
declare
  profile_record jsonb;
  experience_record record;
  payload jsonb;
  document_context jsonb;
  candidate text;
begin
  select profile into profile_record from public.executive_identities where id=target_identity;
  candidate:=coalesce(
    nullif(trim(profile_record->>'fullName'),''),
    nullif(trim(profile_record->>'full_name'),''),
    nullif(trim(profile_record->>'displayName'),''),
    nullif(trim(profile_record->>'name'),''),
    nullif(trim(concat_ws(' ',nullif(profile_record->>'firstName',''),nullif(profile_record->>'lastName',''))),''),
    nullif(trim(concat_ws(' ',nullif(profile_record->>'first_name',''),nullif(profile_record->>'last_name',''))),''),
    nullif(trim(profile_record->>'preferredName'),'')
  );
  if candidate is not null then return candidate; end if;

  for experience_record in
    select notes from public.professional_experiences
    where executive_identity_id=target_identity and archived_at is null and notes is not null
    order by created_at desc limit 10
  loop
    begin
      payload:=experience_record.notes::jsonb;
      if jsonb_typeof(payload->'documentContext')='object' then
        document_context:=payload->'documentContext';
      elsif jsonb_typeof(payload->'documentContext')='string' then
        document_context:=(payload->>'documentContext')::jsonb;
      else
        document_context:=null;
      end if;
      candidate:=nullif(trim(document_context#>>'{profile,fullName}'),'');
      if candidate is not null then return candidate; end if;
    exception when others then
      continue;
    end;
  end loop;
  return 'Verified executive';
end
$$;

revoke all on function public.room_confirmed_executive_name(uuid) from public,anon,authenticated;

create or replace function public.get_room_member_directory(target_room uuid)
returns table(executive_identity_id uuid, display_name text, role text)
language sql stable security definer set search_path=public as $$
  select m.executive_identity_id,
    public.room_confirmed_executive_name(m.executive_identity_id) as display_name,
    m.role
  from public.executive_room_memberships m
  where m.room_id=target_room and m.status='Active' and public.is_active_room_member(target_room)
  order by case m.role when 'Owner' then 1 when 'Moderator' then 2 else 3 end,m.joined_at
$$;

revoke all on function public.get_room_member_directory(uuid) from public,anon;
grant execute on function public.get_room_member_directory(uuid) to authenticated;

commit;
