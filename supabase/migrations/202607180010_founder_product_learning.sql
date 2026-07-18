begin;

create table public.product_learning_events(
  id uuid primary key,
  workspace_id uuid not null references public.workspaces(id),
  executive_identity_id uuid not null references public.executive_identities(id),
  session_key uuid not null,
  event_type text not null check(event_type in('page_view','engagement','feature_use','funnel')),
  surface text not null check(surface ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  route text not null check(route ~ '^/[a-zA-Z0-9/_-]*$' and length(route)<=160),
  duration_seconds integer check(duration_seconds between 0 and 3600),
  device_class text not null check(device_class in('Desktop','Tablet','Mobile','Unknown')),
  browser_family text not null check(browser_family in('Safari','Chrome','Firefox','Edge','Other','Unknown')),
  occurred_at timestamptz not null default now()
);

alter table public.product_learning_events enable row level security;
create index product_learning_events_occurred_idx on public.product_learning_events(occurred_at desc);
create index product_learning_events_identity_session_idx on public.product_learning_events(executive_identity_id,session_key,occurred_at desc);
create index product_learning_events_surface_idx on public.product_learning_events(surface,occurred_at desc);

revoke all on public.product_learning_events from public,anon,authenticated;

create or replace function public.record_product_learning_event(
  event_id uuid,
  event_session uuid,
  event_type_input text,
  event_surface text,
  event_route text,
  event_duration_seconds integer,
  event_device_class text,
  event_browser_family text
) returns boolean
language plpgsql security definer set search_path=public as $$
declare
  actor uuid;
  target_workspace uuid;
begin
  select m.executive_identity_id,m.workspace_id into actor,target_workspace
  from public.workspace_memberships m
  join public.executive_identities e on e.id=m.executive_identity_id
  where e.auth_user_id=auth.uid() and m.status='Active' and m.archived_at is null
  order by m.created_at asc limit 1;

  if actor is null then raise exception 'Active authenticated membership required' using errcode='42501'; end if;
  if event_type_input not in('page_view','engagement','feature_use','funnel') then raise exception 'Unsupported product-learning event' using errcode='22023'; end if;
  if event_surface is null or event_surface !~ '^[a-z0-9][a-z0-9_-]{0,63}$' then raise exception 'Invalid product-learning surface' using errcode='22023'; end if;
  if event_route is null or event_route !~ '^/[a-zA-Z0-9/_-]*$' or length(event_route)>160 then raise exception 'Invalid product-learning route' using errcode='22023'; end if;
  if event_duration_seconds is not null and (event_duration_seconds<0 or event_duration_seconds>3600) then raise exception 'Invalid engagement duration' using errcode='22023'; end if;
  if event_device_class not in('Desktop','Tablet','Mobile','Unknown') then raise exception 'Invalid device class' using errcode='22023'; end if;
  if event_browser_family not in('Safari','Chrome','Firefox','Edge','Other','Unknown') then raise exception 'Invalid browser family' using errcode='22023'; end if;

  insert into public.product_learning_events(id,workspace_id,executive_identity_id,session_key,event_type,surface,route,duration_seconds,device_class,browser_family)
  values(event_id,target_workspace,actor,event_session,event_type_input,event_surface,event_route,event_duration_seconds,event_device_class,event_browser_family)
  on conflict(id) do nothing;
  return true;
end$$;

revoke all on function public.record_product_learning_event(uuid,uuid,text,text,text,integer,text,text) from public,anon;
grant execute on function public.record_product_learning_event(uuid,uuid,text,text,text,integer,text,text) to authenticated;

create or replace function public.get_founder_product_learning_dashboard(window_days integer default 30)
returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  since timestamptz;
  result jsonb;
begin
  if not exists(select 1 from public.founder_bootstrap_audit_events where auth_user_id=auth.uid()) then
    raise exception 'Founder authorization required' using errcode='42501';
  end if;
  if window_days<1 or window_days>365 then raise exception 'Window must be between 1 and 365 days' using errcode='22023'; end if;
  since:=now()-make_interval(days=>window_days);

  with scoped as (
    select * from public.product_learning_events where occurred_at>=since
  ), identity_days as (
    select executive_identity_id,count(distinct occurred_at::date) active_days from scoped group by executive_identity_id
  ), sessions as (
    select executive_identity_id,session_key,max(duration_seconds) filter(where event_type='engagement') duration_seconds
    from scoped group by executive_identity_id,session_key
  ), summary as (
    select
      (select count(distinct executive_identity_id) from scoped) executives,
      (select count(*) from sessions) sessions,
      (select count(*) from identity_days where active_days>1) returning_executives,
      coalesce((select round(avg(duration_seconds)) from sessions where duration_seconds is not null),0) average_session_seconds
  ), features as (
    select coalesce(jsonb_agg(jsonb_build_object('name',surface,'events',events,'executives',executives) order by events desc),'[]'::jsonb) value
    from (select surface,count(*) events,count(distinct executive_identity_id) executives from scoped where event_type in('page_view','feature_use') group by surface order by events desc limit 20) f
  ), funnel as (
    select coalesce(jsonb_agg(jsonb_build_object('stage',surface,'executives',executives) order by stage_order),'[]'::jsonb) value
    from (select surface,count(distinct executive_identity_id) executives,
      case surface when 'profile' then 1 when 'cv_import' then 2 when 'opportunities' then 3 when 'opportunity_review' then 4 when 'atlas' then 5 when 'applications' then 6 else 99 end stage_order
      from scoped where event_type in('page_view','funnel') and surface in('profile','cv_import','opportunities','opportunity_review','atlas','applications') group by surface) x
  ), devices as (
    select coalesce(jsonb_agg(jsonb_build_object('name',device_class,'sessions',sessions) order by sessions desc),'[]'::jsonb) value
    from (select device_class,count(distinct session_key) sessions from scoped group by device_class) d
  ), browsers as (
    select coalesce(jsonb_agg(jsonb_build_object('name',browser_family,'sessions',sessions) order by sessions desc),'[]'::jsonb) value
    from (select browser_family,count(distinct session_key) sessions from scoped group by browser_family) b
  ), confirmed_profiles as (
    select p.executive_identity_id,p.payload
    from public.executive_geographic_profiles p
    where exists(select 1 from scoped s where s.executive_identity_id=p.executive_identity_id)
  ), profile_dimensions as (
    select jsonb_build_object(
      'countries',coalesce((select jsonb_agg(jsonb_build_object('name',country,'executives',executives) order by executives desc) from (
        select payload#>>'{currentCountry,value}' country,count(*) executives from confirmed_profiles where payload#>>'{currentCountry,state}'='Confirmed' and coalesce(payload#>>'{currentCountry,value}','')<>'' group by 1
      ) q),'[]'::jsonb),
      'regions',coalesce((select jsonb_agg(jsonb_build_object('name',region,'executives',executives) order by executives desc) from (
        select region,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{preferredRegions,value}','[]'::jsonb)) region where payload#>>'{preferredRegions,state}'='Confirmed' group by region
      ) q),'[]'::jsonb),
      'preferredIndustries',coalesce((select jsonb_agg(jsonb_build_object('name',industry,'executives',executives) order by executives desc) from (
        select industry,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{manualPreferences,industries}','[]'::jsonb)) industry group by industry
      ) q),'[]'::jsonb),
      'preferredTitles',coalesce((select jsonb_agg(jsonb_build_object('name',title,'executives',executives) order by executives desc) from (
        select title,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{manualPreferences,titles}','[]'::jsonb)) title group by title
      ) q),'[]'::jsonb),
      'preferredSeniorities',coalesce((select jsonb_agg(jsonb_build_object('name',seniority,'executives',executives) order by executives desc) from (
        select seniority,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{manualPreferences,seniorities}','[]'::jsonb)) seniority group by seniority
      ) q),'[]'::jsonb),
      'preferredCompanySizes',coalesce((select jsonb_agg(jsonb_build_object('name',company_size,'executives',executives) order by executives desc) from (
        select company_size,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{manualPreferences,companySizes}','[]'::jsonb)) company_size group by company_size
      ) q),'[]'::jsonb),
      'preferredWorkModels',coalesce((select jsonb_agg(jsonb_build_object('name',work_model,'executives',executives) order by executives desc) from (
        select work_model,count(distinct executive_identity_id) executives from confirmed_profiles cross join lateral jsonb_array_elements_text(coalesce(payload#>'{manualPreferences,remotePreferences}','[]'::jsonb)) work_model group by work_model
      ) q),'[]'::jsonb)
    ) value
  )
  select jsonb_build_object(
    'windowDays',window_days,'generatedAt',now(),
    'executives',summary.executives,'sessions',summary.sessions,'returningExecutives',summary.returning_executives,
    'averageSessionSeconds',summary.average_session_seconds,'features',features.value,'funnel',funnel.value,
    'devices',devices.value,'browsers',browsers.value,'profileDimensions',profile_dimensions.value
  ) into result from summary,features,funnel,devices,browsers,profile_dimensions;
  return result;
end$$;

revoke all on function public.get_founder_product_learning_dashboard(integer) from public,anon;
grant execute on function public.get_founder_product_learning_dashboard(integer) to authenticated;

comment on table public.product_learning_events is 'First-party privacy-minimized product learning. No IP addresses, raw user agents, emails, CV content, age, gender or exact location.';
comment on function public.get_founder_product_learning_dashboard(integer) is 'Founder-bootstrap-authorized aggregate product-learning view; raw executive activity is never returned.';

commit;
