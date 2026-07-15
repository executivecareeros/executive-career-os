import { psql, pass } from "./database-runtime.mjs";
import { randomUUID } from "node:crypto";

const identifiers = new Map([
  ["81000000-0000-4000-8000-000000000001", randomUUID()],
  ["82000000-0000-4000-8000-000000000001", randomUUID()],
  ["83000000-0000-4000-8000-000000000001", randomUUID()],
  ["84000000-0000-4000-8000-000000000001", randomUUID()],
  ["85000000-0000-4000-8000-000000000001", randomUUID()],
  ["85000000-0000-4000-8000-000000000002", randomUUID()],
  ["86000000-0000-4000-8000-000000000001", randomUUID()],
  ["88000000-0000-4000-8000-000000000001", randomUUID()],
  ["88000000-0000-4000-8000-000000000002", randomUUID()],
]);

let scenario = `begin;
insert into auth.users(id,email,email_confirmed_at) values('82000000-0000-4000-8000-000000000001','fictional.collected@example.invalid',now());
insert into public.executive_identities(id,auth_user_id,profile) values('81000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','{"isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values('83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Fictional Collected Decision','Personal','81000000-0000-4000-8000-000000000001');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values('84000000-0000-4000-8000-000000000001','83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Owner','Active','81000000-0000-4000-8000-000000000001');
insert into public.executive_blueprints(id,domain_id,workspace_id,payload,created_by) values('85000000-0000-4000-8000-000000000001','collected-blueprint','83000000-0000-4000-8000-000000000001','{}','81000000-0000-4000-8000-000000000001');
insert into public.executive_blueprint_revisions(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by,blueprint_id,revision_number) values('85000000-0000-4000-8000-000000000002','collected-blueprint-r1','83000000-0000-4000-8000-000000000001',1,now(),gen_random_uuid(),'{"status":"Active"}','81000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001',1);
insert into public.opportunities(id,domain_id,workspace_id,title,status,payload,created_by,version) values('86000000-0000-4000-8000-000000000001','discovered-fictional-one','83000000-0000-4000-8000-000000000001','Fictional CRO','Discovered','{"companyName":"Fictional Company","jobTitle":"Fictional CRO","executiveDecisionDraft":{"action":"Watch"}}','81000000-0000-4000-8000-000000000001',1);
set local role authenticated;
select set_config('request.jwt.claim.sub','82000000-0000-4000-8000-000000000001',true);
select public.finalize_collected_opportunity_decision('{"workspaceId":"83000000-0000-4000-8000-000000000001","blueprintRevisionId":"85000000-0000-4000-8000-000000000002","opportunityId":"86000000-0000-4000-8000-000000000001","opportunityVersion":1,"idempotencyKey":"88000000-0000-4000-8000-000000000001","selectedAction":"Watch","intelligence":{"opportunityId":"discovered-fictional-one","blueprintRevisionId":"85000000-0000-4000-8000-000000000002","compatibilityScore":80,"confidence":{"score":70},"classifiedEvidence":[],"strengths":[],"concerns":[],"missingInformation":[],"executiveQuestions":[],"recommendation":"Monitor"}}'::jsonb);
select public.finalize_collected_opportunity_decision('{"workspaceId":"83000000-0000-4000-8000-000000000001","blueprintRevisionId":"85000000-0000-4000-8000-000000000002","opportunityId":"86000000-0000-4000-8000-000000000001","opportunityVersion":1,"idempotencyKey":"88000000-0000-4000-8000-000000000001","selectedAction":"Watch","intelligence":{"opportunityId":"discovered-fictional-one","blueprintRevisionId":"85000000-0000-4000-8000-000000000002"}}'::jsonb);
select public.finalize_collected_opportunity_decision('{"workspaceId":"83000000-0000-4000-8000-000000000001","blueprintRevisionId":"85000000-0000-4000-8000-000000000002","opportunityId":"86000000-0000-4000-8000-000000000001","opportunityVersion":1,"idempotencyKey":"88000000-0000-4000-8000-000000000002","selectedAction":"Pursue","intelligence":{"opportunityId":"discovered-fictional-one","blueprintRevisionId":"85000000-0000-4000-8000-000000000002"}}'::jsonb);
reset role;
select 'commits',count(*) from public.beta_decision_commits where workspace_id='83000000-0000-4000-8000-000000000001' and domain_id like 'collected-decision-%';
select 'reasoning',count(*) from public.atlas_reasoning_snapshots where workspace_id='83000000-0000-4000-8000-000000000001';
select 'decisions',count(*) from public.atlas_decision_snapshots where workspace_id='83000000-0000-4000-8000-000000000001';
select 'ledger',count(*) from public.career_ledger_entries where workspace_id='83000000-0000-4000-8000-000000000001';
select 'tasks',count(*) from public.executive_tasks where workspace_id='83000000-0000-4000-8000-000000000001';
select 'finalized',count(*) from public.opportunities where id='86000000-0000-4000-8000-000000000001' and payload->'executiveDecision'->>'status'='Finalized' and payload->'executiveDecision'->>'action'='Watch';
rollback;`;
for (const [fixed, fresh] of identifiers) scenario = scenario.replaceAll(fixed, fresh);
const output = psql(scenario).trim().split("\n");

const counts = new Map(output.filter(line => line.includes("|")).map(line => { const [label,value] = line.split("|"); return [label,Number(value)]; }));
for (const label of ["commits","reasoning","decisions","ledger","tasks","finalized"]) if (counts.get(label)!==1) throw new Error(`${label}: expected 1, got ${counts.get(label)}`);
pass("Collected opportunity decision", "atomic snapshot, decision, ledger, task, lifecycle update, and replay prevention passed");
