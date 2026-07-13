begin;

create table public.founder_bootstrap_configuration(
  singleton boolean primary key default true check(singleton),
  founder_email text not null check(founder_email=lower(trim(founder_email)) and founder_email like '%@%'),
  configured_at timestamptz not null default now(),
  configured_by text not null default current_user,
  locked_at timestamptz,
  version integer not null default 1 check(version>0)
);

create table public.founder_bootstrap_configuration_audit(
  id uuid primary key default gen_random_uuid(),
  action text not null,
  email_digest text not null,
  actor text not null,
  occurred_at timestamptz not null default now()
);

create table public.founder_bootstrap_audit_events(
  singleton boolean primary key default true check(singleton),
  auth_user_id uuid not null unique,
  email_digest text not null,
  identity_id uuid not null unique references public.executive_identities(id),
  workspace_id uuid not null unique references public.workspaces(id),
  membership_id uuid not null unique references public.workspace_memberships(id),
  correlation_id uuid not null unique,
  occurred_at timestamptz not null default now()
);

alter table public.founder_bootstrap_configuration enable row level security;
alter table public.founder_bootstrap_configuration_audit enable row level security;
alter table public.founder_bootstrap_audit_events enable row level security;

create trigger founder_bootstrap_configuration_audit_append_only before update or delete on public.founder_bootstrap_configuration_audit for each row execute function public.reject_append_only_mutation();
create trigger founder_bootstrap_audit_events_append_only before update or delete on public.founder_bootstrap_audit_events for each row execute function public.reject_append_only_mutation();

revoke all on public.founder_bootstrap_configuration from public,anon,authenticated;
revoke all on public.founder_bootstrap_configuration_audit from public,anon,authenticated;
revoke all on public.founder_bootstrap_audit_events from public,anon,authenticated;

create or replace function public.configure_initial_founder_email(configured_email text)
returns void language plpgsql security definer set search_path=public,extensions as $$
declare normalized_email text:=lower(trim(configured_email));
begin
  if normalized_email is null or normalized_email!~'^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'A valid founder email is required' using errcode='22023';
  end if;
  if exists(select 1 from public.founder_bootstrap_audit_events) then
    raise exception 'Founder bootstrap is permanently closed' using errcode='55000';
  end if;
  insert into public.founder_bootstrap_configuration(singleton,founder_email)
  values(true,normalized_email)
  on conflict(singleton) do update set founder_email=excluded.founder_email,configured_at=now(),configured_by=current_user,version=founder_bootstrap_configuration.version+1;
  insert into public.founder_bootstrap_configuration_audit(action,email_digest,actor)
  values('Founder email configured',encode(digest(normalized_email,'sha256'),'hex'),current_user);
end$$;
revoke all on function public.configure_initial_founder_email(text) from public,anon,authenticated;

create or replace function public.get_initial_founder_bootstrap_status()
returns table(status text, email_verified boolean, bootstrap_complete boolean)
language plpgsql security definer set search_path=public,auth as $$
declare caller uuid:=auth.uid(); caller_email text; confirmed_at timestamptz; configured_email text; completed boolean;
begin
  if caller is null then return query select 'AUTHENTICATION_REQUIRED',false,false; return; end if;
  select lower(email),email_confirmed_at into caller_email,confirmed_at from auth.users where id=caller;
  select founder_email into configured_email from public.founder_bootstrap_configuration where singleton;
  select exists(select 1 from public.founder_bootstrap_audit_events) into completed;
  if completed then
    if exists(select 1 from public.founder_bootstrap_audit_events where auth_user_id=caller) then return query select 'COMPLETE',confirmed_at is not null,true;
    else return query select 'CLOSED',confirmed_at is not null,true; end if;
  elsif configured_email is null then return query select 'CONFIGURATION_MISSING',confirmed_at is not null,false;
  elsif caller_email is distinct from configured_email then return query select 'UNAUTHORIZED',confirmed_at is not null,false;
  elsif confirmed_at is null then return query select 'EMAIL_VERIFICATION_REQUIRED',false,false;
  else return query select 'READY',true,false;
  end if;
end$$;
revoke all on function public.get_initial_founder_bootstrap_status() from public,anon;
grant execute on function public.get_initial_founder_bootstrap_status() to authenticated;

create or replace function public.bootstrap_initial_founder(atlas_promise_accepted boolean)
returns table(status text, identity_id uuid, workspace_id uuid, membership_id uuid)
language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  caller uuid:=auth.uid(); caller_email text; confirmed_at timestamptz; configured_email text;
  new_identity uuid:=gen_random_uuid(); new_workspace uuid:=gen_random_uuid(); new_membership uuid:=gen_random_uuid(); correlation uuid:=gen_random_uuid(); occurred timestamptz:=now();
begin
  perform pg_advisory_xact_lock(hashtext('orendalis.initial-founder-bootstrap'));
  if exists(select 1 from public.founder_bootstrap_audit_events) then
    if exists(select 1 from public.founder_bootstrap_audit_events a where a.auth_user_id=caller) then
      return query select 'ALREADY_BOOTSTRAPPED',a.identity_id,a.workspace_id,a.membership_id from public.founder_bootstrap_audit_events a where a.auth_user_id=caller;
      return;
    end if;
    return query select 'CLOSED',null::uuid,null::uuid,null::uuid; return;
  end if;
  if caller is null then return query select 'AUTHENTICATION_REQUIRED',null::uuid,null::uuid,null::uuid; return; end if;
  select lower(email),email_confirmed_at into caller_email,confirmed_at from auth.users where id=caller;
  select c.founder_email into configured_email from public.founder_bootstrap_configuration c where c.singleton for update;
  if configured_email is null then return query select 'CONFIGURATION_MISSING',null::uuid,null::uuid,null::uuid; return; end if;
  if confirmed_at is null then return query select 'EMAIL_VERIFICATION_REQUIRED',null::uuid,null::uuid,null::uuid; return; end if;
  if caller_email is distinct from configured_email then return query select 'UNAUTHORIZED',null::uuid,null::uuid,null::uuid; return; end if;
  if atlas_promise_accepted is distinct from true then return query select 'ATLAS_PROMISE_REQUIRED',null::uuid,null::uuid,null::uuid; return; end if;
  if exists(select 1 from public.executive_identities) or exists(select 1 from public.workspaces) or exists(select 1 from public.workspace_memberships) then
    return query select 'FRESH_STATE_REQUIRED',null::uuid,null::uuid,null::uuid; return;
  end if;

  insert into public.executive_identities(id,auth_user_id,profile,atlas_promise_accepted_at)
  values(new_identity,caller,jsonb_build_object('bootstrapRole','Founder','onboardingStatus','Pending'),occurred);
  insert into public.workspaces(id,owner_identity_id,name,workspace_type,status,plan,created_by)
  values(new_workspace,new_identity,'Founder Career Memory','Personal','Active','Free',new_identity);
  insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by)
  values(new_membership,new_workspace,new_identity,'Owner','Active',new_identity);
  insert into public.workspace_settings(id,domain_id,workspace_id,payload,created_by)
  values(gen_random_uuid(),'default-settings',new_workspace,jsonb_build_object('bootstrapStatus','Complete','atlasPromiseAcceptedAt',occurred,'language','Pending','timezone','Pending'),new_identity);
  insert into public.executive_blueprints(id,domain_id,workspace_id,payload,created_by)
  values(gen_random_uuid(),'executive-blueprint',new_workspace,jsonb_build_object('status','Empty','completionStage','Not Started'),new_identity);
  insert into public.career_ledger_entries(id,domain_id,workspace_id,payload,sequence_number,occurred_at,correlation_id,created_by)
  values(gen_random_uuid(),'career-memory-initialized',new_workspace,jsonb_build_object('eventType','System Initialization','careerFacts',jsonb_build_array()),1,occurred,correlation,new_identity);
  insert into public.atlas_decision_snapshots(id,domain_id,workspace_id,payload,sequence_number,occurred_at,correlation_id,created_by)
  values(gen_random_uuid(),'atlas-context-created',new_workspace,jsonb_build_object('status','Ready','source','Founder Bootstrap','evidence',jsonb_build_array()),1,occurred,correlation,new_identity);
  insert into public.founder_bootstrap_audit_events(singleton,auth_user_id,email_digest,identity_id,workspace_id,membership_id,correlation_id,occurred_at)
  values(true,caller,encode(digest(caller_email,'sha256'),'hex'),new_identity,new_workspace,new_membership,correlation,occurred);
  update public.founder_bootstrap_configuration set locked_at=occurred,version=version+1 where singleton;
  return query select 'COMPLETE',new_identity,new_workspace,new_membership;
end$$;
revoke all on function public.bootstrap_initial_founder(boolean) from public,anon;
grant execute on function public.bootstrap_initial_founder(boolean) to authenticated;

commit;
