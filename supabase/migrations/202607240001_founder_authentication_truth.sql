begin;

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
      (select count(*) from auth.users where email_confirmed_at is not null) verified_accounts,
      (select count(*) from public.executive_identities where status='Active') registered_executives,
      (select count(*) from auth.users u left join public.executive_identities i on i.auth_user_id=u.id where u.email_confirmed_at is not null and i.id is null) accounts_awaiting_workspace,
      (select count(distinct user_id) from auth.identities where provider='linkedin_oidc') linkedin_accounts,
      (select count(distinct executive_identity_id) from public.product_learning_events where occurred_at>=now()-interval '15 minutes') active_now,
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
    select p.executive_identity_id,p.payload from public.executive_geographic_profiles p
    where exists(select 1 from scoped s where s.executive_identity_id=p.executive_identity_id)
  ), current_titles as (
    select distinct on(executive_identity_id) executive_identity_id,role_title from public.professional_experiences
    where archived_at is null and coalesce(trim(role_title),'')<>'' and exists(select 1 from scoped s where s.executive_identity_id=professional_experiences.executive_identity_id)
    order by executive_identity_id,is_current desc,start_date desc nulls last,created_at desc
  ), profile_dimensions as (
    select jsonb_build_object(
      'countries',coalesce((select jsonb_agg(jsonb_build_object('name',country,'executives',executives) order by executives desc) from (select payload#>>'{currentCountry,value}' country,count(*) executives from confirmed_profiles where payload#>>'{currentCountry,state}'='Confirmed' and coalesce(payload#>>'{currentCountry,value}','')<>'' group by 1) q),'[]'::jsonb),
      'currentTitles',coalesce((select jsonb_agg(jsonb_build_object('name',role_title,'executives',executives) order by executives desc,role_title) from (select role_title,count(*) executives from current_titles group by role_title) q),'[]'::jsonb),
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
    'verifiedAccounts',summary.verified_accounts,'registeredExecutives',summary.registered_executives,
    'accountsAwaitingWorkspace',summary.accounts_awaiting_workspace,'linkedInAccounts',summary.linkedin_accounts,
    'activeNow',summary.active_now,'executives',summary.executives,'sessions',summary.sessions,
    'returningExecutives',summary.returning_executives,'averageSessionSeconds',summary.average_session_seconds,
    'features',features.value,'funnel',funnel.value,'devices',devices.value,'browsers',browsers.value,
    'profileDimensions',profile_dimensions.value
  ) into result from summary,features,funnel,devices,browsers,profile_dimensions;
  return result;
end$$;

revoke all on function public.get_founder_product_learning_dashboard(integer) from public,anon;
grant execute on function public.get_founder_product_learning_dashboard(integer) to authenticated;

commit;
