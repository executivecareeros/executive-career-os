begin;

alter table public.executive_rooms
  add column language_name text not null default 'English' check(char_length(language_name) between 2 and 80),
  add column short_purpose text,
  add column room_type text not null default 'Discussion' check(room_type in ('Discussion','ServiceMarketplace')),
  add column permanence_status text not null default 'Permanent' check(permanence_status in ('Temporary','PendingFounderApproval','Permanent','Rejected')),
  add column permanence_reason text,
  add column permanence_requested_at timestamptz,
  add column permanence_decided_at timestamptz,
  add column permanence_decided_by uuid references public.executive_identities(id),
  add column permanence_decision_note text,
  add column platform_managed boolean not null default false,
  add column operator_label text;

alter table public.executive_room_messages
  add column structured_context jsonb not null default '{}';

alter table public.executive_room_moderation_events
  drop constraint executive_room_moderation_events_event_type_check;
alter table public.executive_room_moderation_events
  add constraint executive_room_moderation_events_event_type_check check(event_type in (
    'RoomCreated','MemberInvited','MemberJoined','MemberLeft','MessagePinned','MessageUnpinned',
    'RoomArchived','AtlasInvoked','PermanenceRequested','PermanenceApproved','PermanenceRejected','PlatformRoomJoined'
  ));

update public.executive_rooms
set short_purpose=left(topic,180),
    permanence_status=case when is_temporary then 'Temporary' else 'Permanent' end,
    language_name='English'
where short_purpose is null;

alter table public.executive_rooms alter column short_purpose set not null;
alter table public.executive_rooms add constraint executive_rooms_short_purpose_length check(char_length(short_purpose) between 10 and 180);
alter table public.executive_rooms add constraint executive_rooms_permanence_reason_check check(
  permanence_status not in ('PendingFounderApproval','Rejected') or char_length(coalesce(permanence_reason,'')) between 20 and 600
);
alter table public.executive_rooms add constraint executive_rooms_platform_operator_check check(not platform_managed or operator_label is not null);

create table public.executive_room_permanence_decisions(
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.executive_rooms(id) on delete cascade,
  decision text not null check(decision in ('Requested','Approved','Rejected')),
  reason text not null check(char_length(reason) between 3 and 600),
  actor_identity_id uuid not null references public.executive_identities(id),
  occurred_at timestamptz not null default now()
);
alter table public.executive_room_permanence_decisions enable row level security;
revoke all on public.executive_room_permanence_decisions from public,anon,authenticated;
create trigger executive_room_permanence_decisions_append_only before update or delete on public.executive_room_permanence_decisions for each row execute function public.reject_append_only_mutation();

create or replace function public.is_configured_founder()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select exists(
    select 1 from public.founder_bootstrap_configuration c
    join auth.users u on lower(u.email)=c.founder_email
    where c.singleton and u.id=auth.uid() and u.email_confirmed_at is not null
  )
$$;
revoke all on function public.is_configured_founder() from public,anon;
grant execute on function public.is_configured_founder() to authenticated;

create policy open_rooms_verified_read on public.executive_rooms for select to authenticated
using(status='Active' and public.current_executive_identity_id() is not null);

create or replace function public.create_executive_room_v2(
  room_title text,
  room_topic text,
  room_short_purpose text,
  room_language text,
  permanence_request_reason text,
  requested_closes_at timestamptz default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid; target_workspace uuid; new_room uuid; close_time timestamptz;
begin
  actor:=public.current_executive_identity_id();
  select m.workspace_id into target_workspace from workspace_memberships m where m.executive_identity_id=actor and m.status='Active' and m.archived_at is null order by m.created_at limit 1;
  if actor is null or target_workspace is null then raise exception 'An active verified executive workspace is required'; end if;
  if char_length(trim(room_title)) not between 3 and 100 or char_length(trim(room_topic)) not between 10 and 600 then raise exception 'Room title or topic is outside the allowed length'; end if;
  if char_length(trim(room_short_purpose)) not between 10 and 180 then raise exception 'A short room purpose is required'; end if;
  if char_length(trim(room_language)) not between 2 and 80 then raise exception 'A room language is required'; end if;
  if char_length(trim(permanence_request_reason)) not between 20 and 600 then raise exception 'Explain why this room should become permanent'; end if;
  close_time:=coalesce(requested_closes_at,now()+interval '30 days');
  if close_time<=now() then raise exception 'Temporary rooms require a future closing time'; end if;
  insert into executive_rooms(workspace_id,title,topic,short_purpose,language_name,is_temporary,closes_at,permanence_status,permanence_reason,permanence_requested_at,created_by)
  values(target_workspace,trim(room_title),trim(room_topic),trim(room_short_purpose),trim(room_language),true,close_time,'PendingFounderApproval',trim(permanence_request_reason),now(),actor)
  returning id into new_room;
  insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(new_room,actor,'Owner',actor);
  insert into executive_room_permanence_decisions(room_id,decision,reason,actor_identity_id) values(new_room,'Requested',trim(permanence_request_reason),actor);
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata) values(new_room,'RoomCreated',actor,jsonb_build_object('language',trim(room_language),'permanence','PendingFounderApproval'));
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id) values(new_room,'PermanenceRequested',actor);
  return new_room;
end$$;

create or replace function public.get_founder_room_permanence_requests()
returns table(room_id uuid,title text,short_purpose text,language_name text,permanence_reason text,creator_name text,requested_at timestamptz,closes_at timestamptz)
language plpgsql stable security definer set search_path=public as $$
begin
  if not public.is_configured_founder() then raise exception 'Founder access required' using errcode='42501'; end if;
  return query select r.id,r.title,r.short_purpose,r.language_name,r.permanence_reason,
    coalesce(nullif(trim(coalesce(i.profile->>'fullName',i.profile->>'full_name',concat_ws(' ',i.profile->>'firstName',i.profile->>'lastName'))),''),'Verified executive'),
    r.permanence_requested_at,r.closes_at
  from executive_rooms r join executive_identities i on i.id=r.created_by
  where r.permanence_status='PendingFounderApproval' order by r.permanence_requested_at;
end$$;

create or replace function public.decide_room_permanence(target_room uuid,approve boolean,decision_note text)
returns void language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); room_record executive_rooms%rowtype;
begin
  if not public.is_configured_founder() or actor is null then raise exception 'Founder access required' using errcode='42501'; end if;
  if char_length(trim(decision_note)) not between 3 and 600 then raise exception 'A decision note is required'; end if;
  select * into room_record from executive_rooms where id=target_room for update;
  if room_record.id is null or room_record.permanence_status<>'PendingFounderApproval' then raise exception 'Room request is not pending'; end if;
  update executive_rooms set permanence_status=case when approve then 'Permanent' else 'Rejected' end,
    is_temporary=not approve,closes_at=case when approve then null else closes_at end,
    permanence_decided_at=now(),permanence_decided_by=actor,permanence_decision_note=trim(decision_note),updated_at=now()
  where id=target_room;
  insert into executive_room_permanence_decisions(room_id,decision,reason,actor_identity_id)
  values(target_room,case when approve then 'Approved' else 'Rejected' end,trim(decision_note),actor);
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id)
  values(target_room,case when approve then 'PermanenceApproved' else 'PermanenceRejected' end,actor);
end$$;

create or replace function public.join_executive_room(target_room uuid)
returns void language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); founder uuid;
begin
  if actor is null then raise exception 'Verified executive access required' using errcode='42501'; end if;
  if not exists(select 1 from executive_rooms where id=target_room and status='Active') then raise exception 'Room is unavailable'; end if;
  select created_by into founder from executive_rooms where id=target_room;
  insert into executive_room_memberships(room_id,executive_identity_id,role,status,created_by)
  values(target_room,actor,'Participant','Active',founder)
  on conflict(room_id,executive_identity_id) do update set status='Active',role='Participant',left_at=null;
  insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,subject_identity_id) values(target_room,'PlatformRoomJoined',actor,actor);
end$$;

create or replace function public.post_executive_room_message_v2(
  target_room uuid,message_body text,reply_to uuid default null,service_category text default null,service_city text default null,service_country text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare actor uuid:=public.current_executive_identity_id(); new_message uuid; room_record executive_rooms%rowtype; context jsonb:='{}';
begin
  if not public.is_active_room_member(target_room) then raise exception 'Room not available'; end if;
  select * into room_record from executive_rooms where id=target_room;
  if room_record.status<>'Active' then raise exception 'Archived rooms are read only'; end if;
  if char_length(trim(message_body)) not between 1 and 4000 then raise exception 'Messages must contain 1 to 4000 characters'; end if;
  if reply_to is not null and not exists(select 1 from executive_room_messages where id=reply_to and room_id=target_room and archived_at is null) then raise exception 'Reply target is not available in this room'; end if;
  if room_record.room_type='ServiceMarketplace' and reply_to is null then
    if char_length(trim(coalesce(service_category,''))) not between 2 and 80 or char_length(trim(coalesce(service_city,''))) not between 2 and 100 or char_length(trim(coalesce(service_country,''))) not between 2 and 100 then raise exception 'Service category, city and country are required'; end if;
    context:=jsonb_build_object('serviceCategory',trim(service_category),'city',trim(service_city),'country',trim(service_country));
  end if;
  insert into executive_room_messages(room_id,parent_message_id,author_identity_id,body,structured_context) values(target_room,reply_to,actor,trim(message_body),context) returning id into new_message;
  update executive_rooms set updated_at=now() where id=target_room;
  return new_message;
end$$;

revoke all on function public.create_executive_room_v2(text,text,text,text,text,timestamptz) from public,anon;
revoke all on function public.get_founder_room_permanence_requests() from public,anon;
revoke all on function public.decide_room_permanence(uuid,boolean,text) from public,anon;
revoke all on function public.join_executive_room(uuid) from public,anon;
revoke all on function public.post_executive_room_message_v2(uuid,text,uuid,text,text,text) from public,anon;
grant execute on function public.create_executive_room_v2(text,text,text,text,text,timestamptz) to authenticated;
grant execute on function public.get_founder_room_permanence_requests() to authenticated;
grant execute on function public.decide_room_permanence(uuid,boolean,text) to authenticated;
grant execute on function public.join_executive_room(uuid) to authenticated;
grant execute on function public.post_executive_room_message_v2(uuid,text,uuid,text,text,text) to authenticated;

create or replace function public.get_executive_room_activity_status()
returns table(state text,label text,active_rooms integer,present_executives integer,unanswered_questions integer)
language sql stable security definer set search_path=public as $$
  with accessible_rooms as (
    select r.id from public.executive_rooms r
    where r.status='Active' and public.current_executive_identity_id() is not null
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
  select case when questions>0 then 'question' when messages>=2 and authors>=2 then 'active' when present>0 then 'present' else 'quiet' end,
    case when questions>0 then questions||case when questions=1 then ' unanswered executive question' else ' unanswered executive questions' end
         when messages>=2 and authors>=2 then 'Active room discussion'
         when present>0 then present||case when present=1 then ' executive in Rooms' else ' executives in Rooms' end
         else 'No one currently in Rooms' end,
    rooms,present,questions from totals
$$;

do $$
declare founder_id uuid; founder_workspace uuid; seed record; room_id uuid;
begin
  select i.id,m.workspace_id into founder_id,founder_workspace
  from founder_bootstrap_configuration c join auth.users u on lower(u.email)=c.founder_email
  join executive_identities i on i.auth_user_id=u.id
  join workspace_memberships m on m.executive_identity_id=i.id and m.status='Active' and m.archived_at is null
  where c.singleton limit 1;
  if founder_id is null then raise exception 'Founder identity is required before Atlas rooms can be seeded'; end if;
  for seed in select * from (values
    ('Opportunities','Share and examine executive opportunities, market signals, and application insights.','Discussion'),
    ('Executive Questions','Ask focused career, leadership, and decision questions to trusted executives.','Discussion'),
    ('ORENDALIS Café','An informal English conversation space for executives to connect beyond active decisions.','Discussion'),
    ('Local Services Marketplace','Request or recommend trusted local help, classified by service, city, and country.','ServiceMarketplace'),
    ('Leadership Decisions','Discuss difficult leadership choices, trade-offs, and evidence with experienced peers.','Discussion'),
    ('Career Transitions','Exchange practical insight on confidential career moves and executive transitions.','Discussion'),
    ('Company Intelligence','Compare employer evidence, leadership context, and company developments.','Discussion'),
    ('Executive Technology & AI','Discuss how technology and AI affect executive leadership and business outcomes.','Discussion'),
    ('Global Markets','Exchange evidence about regions, sectors, market entry, and international leadership.','Discussion'),
    ('Wellbeing & Sustainable Leadership','Discuss sustainable performance, resilience, and the realities of executive responsibility.','Discussion')
  ) s(title,purpose,kind)
  loop
    select id into room_id from executive_rooms where platform_managed and lower(title)=lower(seed.title) limit 1;
    if room_id is null then
      insert into executive_rooms(workspace_id,title,topic,short_purpose,room_type,language_name,status,is_temporary,permanence_status,platform_managed,operator_label,created_by)
      values(founder_workspace,seed.title,seed.purpose,seed.purpose,seed.kind,'English','Active',false,'Permanent',true,'Atlas',founder_id) returning id into room_id;
      insert into executive_room_memberships(room_id,executive_identity_id,role,created_by) values(room_id,founder_id,'Owner',founder_id);
      insert into executive_room_moderation_events(room_id,event_type,actor_identity_id,safe_metadata) values(room_id,'RoomCreated',founder_id,jsonb_build_object('operator','Atlas','language','English','platformManaged',true));
    end if;
  end loop;
end$$;

commit;
