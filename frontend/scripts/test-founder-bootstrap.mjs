import { readFileSync } from "node:fs";
import { psql, pass, sqlFile } from "./database-runtime.mjs";

const migration=readFileSync(sqlFile("supabase/migrations/202607130011_initial_founder_bootstrap.sql"),"utf8");
const proxy=readFileSync(sqlFile("frontend/proxy.ts"),"utf8");
if(!proxy.includes('"/founder-bootstrap"'))throw new Error("Founder bootstrap is unreachable before authentication.");
for(const evidence of ["pg_advisory_xact_lock","email_confirmed_at","FRESH_STATE_REQUIRED","atlas_promise_accepted","founder_bootstrap_audit_events","revoke all on public.founder_bootstrap_configuration"]){if(!migration.includes(evidence))throw new Error(`Missing bootstrap safeguard: ${evidence}`);}

const output=psql(`begin;
truncate table public.executive_identities cascade;
truncate table public.founder_bootstrap_configuration,public.founder_bootstrap_configuration_audit,public.founder_bootstrap_audit_events;
insert into auth.users(id,email,email_confirmed_at) values
('97000000-0000-4000-8000-000000000001','fictional.founder@example.invalid',now()),
('97000000-0000-4000-8000-000000000002','wrong.founder@example.invalid',now()),
('97000000-0000-4000-8000-000000000003','unverified.founder@example.invalid',null)
on conflict(id) do update set email=excluded.email,email_confirmed_at=excluded.email_confirmed_at;

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000001',true);
select 'missing_configuration_status',count(*) from public.bootstrap_initial_founder(true) where status='CONFIGURATION_MISSING';
reset role;
select public.configure_initial_founder_email('fictional.founder@example.invalid');

set local role anon;
do $$begin begin perform public.bootstrap_initial_founder(true);raise exception 'anonymous bootstrap executed';exception when insufficient_privilege then null;end;end$$;
do $$begin begin insert into public.founder_bootstrap_configuration(singleton,founder_email)values(true,'attacker@example.invalid');raise exception 'anonymous configuration write succeeded';exception when insufficient_privilege then null;end;end$$;
reset role;

insert into public.executive_identities(id,auth_user_id,profile)values('97100000-0000-4000-8000-000000000001',null,'{}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by)values('97200000-0000-4000-8000-000000000001','97100000-0000-4000-8000-000000000001','Existing Workspace','Personal','97100000-0000-4000-8000-000000000001');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by)values('97300000-0000-4000-8000-000000000001','97200000-0000-4000-8000-000000000001','97100000-0000-4000-8000-000000000001','Owner','Active','97100000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000001',true);
select 'existing_state_status',count(*) from public.bootstrap_initial_founder(true) where status='FRESH_STATE_REQUIRED';
reset role;
truncate table public.executive_identities cascade;

create function pg_temp.fail_bootstrap_settings()returns trigger language plpgsql as $$begin raise exception 'deliberate atomicity test';end$$;
create trigger fail_bootstrap_settings before insert on public.workspace_settings for each row execute function pg_temp.fail_bootstrap_settings();
set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000001',true);
do $$begin begin perform public.bootstrap_initial_founder(true);raise exception 'deliberate failure did not fire';exception when others then if sqlerrm<>'deliberate atomicity test' then raise;end if;end;end$$;
reset role;
drop trigger fail_bootstrap_settings on public.workspace_settings;
select 'atomic_rollback',count(*) from public.executive_identities;

set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000002',true);
select 'wrong_email_status',count(*) from public.bootstrap_initial_founder(true) where status='UNAUTHORIZED';
select 'wrong_email_records',count(*) from public.executive_identities;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000003',true);
select 'unverified_status',count(*) from public.bootstrap_initial_founder(true) where status='EMAIL_VERIFICATION_REQUIRED';
select 'unverified_records',count(*) from public.executive_identities;

select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000001',true);
select 'promise_status',count(*) from public.bootstrap_initial_founder(false) where status='ATLAS_PROMISE_REQUIRED';
select 'promise_rejection_records',count(*) from public.executive_identities;

create temporary table bootstrap_result as select * from public.bootstrap_initial_founder(true);
reset role;
select 'identity',count(*) from public.executive_identities where auth_user_id='97000000-0000-4000-8000-000000000001';
select 'workspace',count(*) from public.workspaces;
select 'owner',count(*) from public.workspace_memberships where role='Owner' and status='Active';
select 'settings',count(*) from public.workspace_settings;
select 'blueprint',count(*) from public.executive_blueprints;
select 'ledger',count(*) from public.career_ledger_entries;
select 'atlas',count(*) from public.atlas_decision_snapshots;
select 'audit',count(*) from public.founder_bootstrap_audit_events;
select 'beta_workflow',count(*) from public.beta_workflow_states where executive_identity_id=(select identity_id from bootstrap_result);
select 'locked',count(*) from public.founder_bootstrap_configuration where locked_at is not null;
set local role authenticated;
select set_config('request.jwt.claim.sub','97000000-0000-4000-8000-000000000001',true);
select 'replay_status',count(*) from public.bootstrap_initial_founder(true) where status='ALREADY_BOOTSTRAPPED';
select 'replay_identity_count',count(*) from public.executive_identities;
select 'founder_permission',count(*) from public.workspaces w where public.has_workspace_permission(w.id,'Invite Members');
create temporary table post_bootstrap_invitation as select * from public.create_beta_invitation((select workspace_id from bootstrap_result),'later.executive@example.invalid','Executive',now()+interval '1 day');
select 'invitation_after_bootstrap',count(*) from post_bootstrap_invitation;
reset role;
do $$begin begin update public.founder_bootstrap_audit_events set occurred_at=now();raise exception 'audit mutation succeeded';exception when sqlstate '55000' then null;end;end$$;
do $$begin begin perform public.configure_initial_founder_email('replacement@example.invalid');raise exception 'configuration changed after closure';exception when sqlstate '55000' then null;end;end$$;
rollback;`).trim().split("\n");

const values=new Map(output.filter(line=>line.includes("|")).map(line=>{const[label,value]=line.split("|");return[label,Number(value)]}));
const expected={missing_configuration_status:1,existing_state_status:1,atomic_rollback:0,wrong_email_status:1,wrong_email_records:0,unverified_status:1,unverified_records:0,promise_status:1,promise_rejection_records:0,identity:1,workspace:1,owner:1,settings:1,blueprint:1,ledger:1,atlas:1,audit:1,beta_workflow:1,locked:1,replay_status:1,replay_identity_count:1,founder_permission:1,invitation_after_bootstrap:1};
for(const[label,value]of Object.entries(expected))if(values.get(label)!==value)throw new Error(`${label}: expected ${value}, got ${values.get(label)}`);
pass("One-time founder bootstrap",Object.entries(expected).map(([key,value])=>`${key}=${value}`).join(", "));
