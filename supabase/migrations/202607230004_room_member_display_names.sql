begin;

create or replace function public.get_room_member_directory(target_room uuid)
returns table(executive_identity_id uuid, display_name text, role text)
language sql stable security definer set search_path=public as $$
  select m.executive_identity_id,
    coalesce(
      nullif(trim(i.profile->>'fullName'),''),
      nullif(trim(i.profile->>'full_name'),''),
      nullif(trim(i.profile->>'displayName'),''),
      nullif(trim(i.profile->>'name'),''),
      nullif(trim(concat_ws(' ',nullif(i.profile->>'firstName',''),nullif(i.profile->>'lastName',''))),''),
      nullif(trim(concat_ws(' ',nullif(i.profile->>'first_name',''),nullif(i.profile->>'last_name',''))),''),
      nullif(trim(i.profile->>'preferredName'),''),
      'Verified executive'
    ) as display_name,
    m.role
  from public.executive_room_memberships m
  join public.executive_identities i on i.id=m.executive_identity_id
  where m.room_id=target_room and m.status='Active' and public.is_active_room_member(target_room)
  order by case m.role when 'Owner' then 1 when 'Moderator' then 2 else 3 end,m.joined_at
$$;

revoke all on function public.get_room_member_directory(uuid) from public,anon;
grant execute on function public.get_room_member_directory(uuid) to authenticated;

commit;
