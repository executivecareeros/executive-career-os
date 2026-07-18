begin;

create table public.executive_room_presence(
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  executive_identity_id uuid not null references public.executive_identities(id),
  last_seen_at timestamptz not null default now(),
  primary key(room_id,executive_identity_id)
);

alter table public.executive_room_presence enable row level security;
create index executive_room_presence_recent_idx on public.executive_room_presence(last_seen_at desc,room_id);
revoke all on public.executive_room_presence from public,anon,authenticated;

create or replace function public.touch_executive_room_presence(target_room uuid)
returns void language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id();
begin
  if actor is null or not public.is_active_room_member(target_room) then raise exception 'Room not available' using errcode='42501'; end if;
  insert into public.executive_room_presence(room_id,executive_identity_id,last_seen_at)
  values(target_room,actor,now())
  on conflict(room_id,executive_identity_id) do update set last_seen_at=excluded.last_seen_at;
end$$;

create or replace function public.get_executive_room_activity_status()
returns table(state text,label text,active_rooms integer,present_executives integer,unanswered_questions integer)
language sql stable security definer set search_path=public as $$
  with accessible_rooms as (
    select r.id
    from public.executive_rooms r
    join public.executive_room_memberships m on m.room_id=r.id
    where m.executive_identity_id=public.current_executive_identity_id() and m.status='Active' and r.status='Active'
  ), presence as (
    select count(distinct p.executive_identity_id)::integer count
    from public.executive_room_presence p join accessible_rooms r on r.id=p.room_id
    where p.last_seen_at>=now()-interval '2 minutes'
  ), recent_messages as (
    select count(*)::integer messages,count(distinct m.author_identity_id)::integer authors
    from public.executive_room_messages m join accessible_rooms r on r.id=m.room_id
    where m.archived_at is null and m.message_kind='Member' and m.created_at>=now()-interval '10 minutes'
  ), questions as (
    select count(*)::integer count
    from public.executive_room_messages q join accessible_rooms r on r.id=q.room_id
    where q.archived_at is null and q.message_kind='Member' and q.created_at>=now()-interval '7 days'
      and trim(q.body) ~ '\?$'
      and not exists(select 1 from public.executive_room_messages reply where reply.parent_message_id=q.id and reply.archived_at is null)
  ), totals as (
    select (select count(*)::integer from accessible_rooms) rooms,presence.count present,recent_messages.messages,recent_messages.authors,questions.count questions
    from presence,recent_messages,questions
  )
  select
    case when questions>0 then 'question' when messages>=2 and authors>=2 then 'active' when present>0 then 'present' else 'quiet' end,
    case when questions>0 then questions||case when questions=1 then ' unanswered executive question' else ' unanswered executive questions' end
         when messages>=2 and authors>=2 then 'Active room discussion'
         when present>0 then present||case when present=1 then ' executive in Rooms' else ' executives in Rooms' end
         else 'No one currently in Rooms' end,
    rooms,present,questions
  from totals
$$;

revoke all on function public.touch_executive_room_presence(uuid) from public,anon;
revoke all on function public.get_executive_room_activity_status() from public,anon;
grant execute on function public.touch_executive_room_presence(uuid) to authenticated;
grant execute on function public.get_executive_room_activity_status() to authenticated;

comment on table public.executive_room_presence is 'Ephemeral room-presence heartbeat. No presence history is exposed; status ignores heartbeats older than two minutes.';

commit;
