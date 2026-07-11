begin;

alter table public.executive_identities add column if not exists atlas_promise_accepted_at timestamptz;
alter table public.executive_identities add column if not exists onboarding_completed_at timestamptz;

create or replace function public.provision_personal_workspace(onboarding jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  auth_user uuid := auth.uid(); identity_id uuid; workspace_id uuid; membership_id uuid;
  preferred_name text := nullif(trim(onboarding->>'preferredName'),'');
begin
  if auth_user is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if coalesce((onboarding->>'atlasPromiseAccepted')::boolean,false) is not true then raise exception 'Atlas Promise acceptance is required' using errcode='23514'; end if;
  if preferred_name is null or nullif(trim(onboarding->>'currentRole'),'') is null or nullif(trim(onboarding->>'country'),'') is null or nullif(trim(onboarding->>'preferredLanguage'),'') is null or nullif(trim(onboarding->>'timezone'),'') is null or nullif(trim(onboarding->>'careerAmbition'),'') is null then raise exception 'Required onboarding fields are missing' using errcode='23502'; end if;

  select id into identity_id from public.executive_identities where auth_user_id=auth_user;
  if identity_id is not null then select w.id into workspace_id from public.workspaces w where w.owner_identity_id=identity_id and w.workspace_type='Personal' and w.archived_at is null order by w.created_at limit 1; if workspace_id is not null then return workspace_id; end if; end if;

  identity_id := coalesce(identity_id,gen_random_uuid()); workspace_id := gen_random_uuid(); membership_id := gen_random_uuid();
  insert into public.executive_identities(id,auth_user_id,profile,atlas_promise_accepted_at,onboarding_completed_at)
  values(identity_id,auth_user,jsonb_build_object('preferredName',preferred_name,'currentRole',onboarding->>'currentRole','currentEmployer',nullif(trim(onboarding->>'currentEmployer'),''),'country',onboarding->>'country','preferredLanguage',onboarding->>'preferredLanguage','timezone',onboarding->>'timezone','careerAmbition',onboarding->>'careerAmbition'),now(),now())
  on conflict(auth_user_id) do update set profile=excluded.profile,atlas_promise_accepted_at=excluded.atlas_promise_accepted_at,onboarding_completed_at=excluded.onboarding_completed_at,updated_at=now() returning id into identity_id;
  insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values(workspace_id,identity_id,preferred_name||'''s Career Memory','Personal',identity_id);
  insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values(membership_id,workspace_id,identity_id,'Owner','Active',identity_id);
  insert into public.workspace_settings(id,domain_id,workspace_id,payload,created_by) values(gen_random_uuid(),'default-settings',workspace_id,jsonb_build_object('language',onboarding->>'preferredLanguage','timezone',onboarding->>'timezone','atlasPromiseAcceptedAt',now()),identity_id);
  insert into public.executive_blueprints(id,domain_id,workspace_id,payload,created_by) values(gen_random_uuid(),'executive-blueprint',workspace_id,jsonb_build_object('status','Empty','completionStage','Not Started'),identity_id);
  insert into public.atlas_decision_snapshots(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by) values(gen_random_uuid(),'atlas-context-created',workspace_id,1,now(),gen_random_uuid(),jsonb_build_object('status','Ready','source','Onboarding'),identity_id);
  return workspace_id;
end$$;
revoke all on function public.provision_personal_workspace(jsonb) from public;
grant execute on function public.provision_personal_workspace(jsonb) to authenticated;

commit;
