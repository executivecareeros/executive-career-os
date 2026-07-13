import { psql, pass } from "./database-runtime.mjs";
import { readFileSync } from "node:fs";
import { sqlFile } from "./database-runtime.mjs";
const summary = psql(`select version();select count(*) from pg_tables where schemaname='public';select count(*) from pg_policies where schemaname='public';select count(*) from pg_trigger where not tgisinternal and tgrelid in(select oid from pg_class where relnamespace='public'::regnamespace);select count(*) from pg_proc where pronamespace='public'::regnamespace and prosecdef;select count(*) from public.workspaces;` ).trim().split("\n");
if (Number(summary[1]) < 27) throw new Error(`Expected at least 27 public tables, found ${summary[1]}`);
if (Number(summary[2]) < 40) throw new Error(`Expected RLS policies, found ${summary[2]}`);
pass("PostgreSQL runtime", summary[0]);pass("Schema catalog", `${summary[1]} tables, ${summary[2]} policies, ${summary[3]} triggers, ${summary[4]} security-definer helpers`);pass("Seed workspace count", summary[5]);
const beforeSeed = psql("select count(*) from public.executive_identities;select count(*) from public.workspaces;select count(*) from public.career_ledger_entries;").trim();
psql(readFileSync(sqlFile("supabase/seed.sql"), "utf8"));
const afterSeed = psql("select count(*) from public.executive_identities;select count(*) from public.workspaces;select count(*) from public.career_ledger_entries;").trim();
if (beforeSeed !== afterSeed) throw new Error(`Seed was not idempotent: ${beforeSeed} became ${afterSeed}`);
pass("Seed idempotency", `stable counts ${afterSeed.replaceAll("\n", "/")}`);
psql(`begin;
do $$begin
  begin insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) select gen_random_uuid(),workspace_id,executive_identity_id,'Viewer','Active',created_by from public.workspace_memberships limit 1;raise exception 'duplicate membership accepted';exception when unique_violation then null;end;
  begin insert into public.compensation_records(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,currency,amount_exact,payload,created_by) select gen_random_uuid(),'invalid-negative',workspace_id,99,now(),gen_random_uuid(),'GBP',-1,'{}',created_by from public.compensation_records limit 1;raise exception 'negative compensation accepted';exception when check_violation then null;end;
  begin insert into public.compensation_records(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,currency,payload,created_by) select gen_random_uuid(),'invalid-currency',workspace_id,99,now(),gen_random_uuid(),'GB','{}',created_by from public.compensation_records limit 1;raise exception 'invalid currency accepted';exception when check_violation then null;end;
  begin insert into public.career_ledger_entries(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by) select gen_random_uuid(),'duplicate-sequence',workspace_id,sequence_number,now(),gen_random_uuid(),'{}',created_by from public.career_ledger_entries limit 1;raise exception 'duplicate ledger sequence accepted';exception when unique_violation then null;end;
  begin insert into public.opportunities(id,domain_id,workspace_id,company_id,payload,created_by) select gen_random_uuid(),'cross-workspace',gen_random_uuid(),id,'{}',created_by from public.companies limit 1;raise exception 'cross-workspace link accepted';exception when foreign_key_violation then null;end;
end$$;rollback;`);
pass("Runtime constraints", "duplicate membership, compensation, ledger sequence, and workspace links rejected");
psql(`begin;
insert into public.document_versions(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by)
select gen_random_uuid(),'runtime-document',w.id,1,now(),gen_random_uuid(),'{}',w.owner_identity_id from public.workspaces w limit 1;
do $$declare t text;begin
  foreach t in array array['career_ledger_entries','compensation_records','executive_blueprint_revisions','atlas_decision_snapshots','knowledge_observations','discovery_runs','document_versions'] loop
    begin execute format('update public.%I set payload=payload where id=(select id from public.%I limit 1)',t,t);raise exception 'append-only update accepted on %',t;exception when sqlstate '55000' then null;end;
    begin execute format('delete from public.%I where id=(select id from public.%I limit 1)',t,t);raise exception 'append-only delete accepted on %',t;exception when sqlstate '55000' then null;end;
  end loop;
end$$;
insert into public.career_ledger_entries(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by)
select gen_random_uuid(),'runtime-correction',workspace_id,sequence_number+1,now(),gen_random_uuid(),'{"correctionOf":"previous-entry"}',created_by from public.career_ledger_entries order by sequence_number desc limit 1;
rollback;`);
pass("Append-only enforcement", "all 7 historical tables reject UPDATE and DELETE; correction append succeeds");
const onboarding = psql(`begin;insert into auth.users(id,email,email_confirmed_at) values('90000000-0000-4000-8000-000000000001','runtime.executive@example.invalid',now());insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest,accepted_at,accepted_by_auth_user) select gen_random_uuid(),w.id,'runtime.executive@example.invalid','Executive','Accepted',now()+interval '1 day',w.owner_identity_id,encode(extensions.digest('runtime-token','sha256'),'hex'),now(),'90000000-0000-4000-8000-000000000001' from public.workspaces w limit 1;set local role authenticated;select set_config('request.jwt.claim.sub','90000000-0000-4000-8000-000000000001',true);
select public.provision_invited_beta_workspace('{"preferredName":"Runtime Executive","currentRole":"Chief Test Officer","country":"Example Country","preferredLanguage":"English","timezone":"UTC","careerAmbition":"Build durable professional judgment","atlasPromiseAccepted":true}'::jsonb);
select public.provision_invited_beta_workspace('{"preferredName":"Runtime Executive","currentRole":"Chief Test Officer","country":"Example Country","preferredLanguage":"English","timezone":"UTC","careerAmbition":"Build durable professional judgment","atlasPromiseAccepted":true}'::jsonb);
reset role;select count(*) from public.executive_identities where auth_user_id='90000000-0000-4000-8000-000000000001';select count(*) from public.workspaces where name='Runtime Executive''s Career Memory';select count(*) from public.workspace_memberships where executive_identity_id=(select id from public.executive_identities where auth_user_id='90000000-0000-4000-8000-000000000001');select count(*) from public.executive_blueprints where workspace_id=(select id from public.workspaces where name='Runtime Executive''s Career Memory');select count(*) from public.atlas_decision_snapshots where workspace_id=(select id from public.workspaces where name='Runtime Executive''s Career Memory');select count(*) from public.beta_workflow_states where executive_identity_id=(select id from public.executive_identities where auth_user_id='90000000-0000-4000-8000-000000000001');rollback;`).trim().split("\n");
const onboardingCounts = onboarding.filter((line) => /^\d+$/.test(line)).slice(-6).map(Number);
if (onboardingCounts.some((count) => count !== 1)) throw new Error(`Onboarding provisioning was not atomic/idempotent: ${onboardingCounts.join("/")}`);
pass("Invited authenticated onboarding", "accepted invitation, identity, workspace, owner membership, workflow, Blueprint, and Atlas context created once");
