import { psql, pass } from "./database-runtime.mjs";

const output = psql(`begin;
insert into public.executive_identities(id,auth_user_id,profile) values
('71000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','{"isDemo":true}'),
('71000000-0000-4000-8000-000000000002','72000000-0000-4000-8000-000000000002','{"isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values('73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Fictional Beta Workspace','Personal','71000000-0000-4000-8000-000000000001');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values
('74000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Owner','Active','71000000-0000-4000-8000-000000000001'),
('74000000-0000-4000-8000-000000000002','73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','Executive','Active','71000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','72000000-0000-4000-8000-000000000001',true);
create temporary table beta_test_invite as select * from public.create_beta_invitation('73000000-0000-4000-8000-000000000001','invited.executive@example.invalid','Executive',now()+interval '1 day');
select set_config('request.jwt.claim.sub','72000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"72000000-0000-4000-8000-000000000002","email":"invited.executive@example.invalid"}',true);
select public.accept_beta_invitation(invite_token) from beta_test_invite;
do $$declare token text:=(select invite_token from beta_test_invite);begin begin perform public.accept_beta_invitation(token);raise exception 'invite replay accepted';exception when sqlstate '55000' then null;end;end$$;
reset role;
select 'accepted_invites',count(*) from public.workspace_invitations where status='Accepted' and accepted_by_auth_user is not null;
insert into public.executive_blueprints(id,domain_id,workspace_id,payload,created_by) values('75000000-0000-4000-8000-000000000001','beta-blueprint','73000000-0000-4000-8000-000000000001','{}','71000000-0000-4000-8000-000000000002');
insert into public.executive_blueprint_revisions(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by,blueprint_id,revision_number) values('75000000-0000-4000-8000-000000000002','beta-blueprint-r1','73000000-0000-4000-8000-000000000001',1,now(),gen_random_uuid(),'{"status":"Active"}','71000000-0000-4000-8000-000000000002','75000000-0000-4000-8000-000000000001',1);
insert into public.companies(id,domain_id,workspace_id,name,payload,created_by) values('76000000-0000-4000-8000-000000000001','fictional-company','73000000-0000-4000-8000-000000000001','Fictional Company','{}','71000000-0000-4000-8000-000000000002');
insert into public.opportunities(id,domain_id,workspace_id,company_id,title,status,payload,created_by,version) values('76000000-0000-4000-8000-000000000002','fictional-opportunity','73000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001','Fictional Executive Role','Draft','{}','71000000-0000-4000-8000-000000000002',1);
insert into public.atlas_reasoning_snapshots(id,domain_id,workspace_id,subject_id,subject_type,sequence_number,occurred_at,correlation_id,input_hash,engine_version,rules_version,payload,created_by) values('77000000-0000-4000-8000-000000000001','fictional-reasoning','73000000-0000-4000-8000-000000000001','fictional-opportunity','Opportunity',1,now(),gen_random_uuid(),'fictional-hash','deterministic-1','beta-1','{"blueprintRevisionId":"75000000-0000-4000-8000-000000000002","opportunityId":"76000000-0000-4000-8000-000000000002"}','71000000-0000-4000-8000-000000000002');
insert into public.beta_workflow_states(domain_id,workspace_id,executive_identity_id,current_step,completed_steps,active_blueprint_revision_id,active_opportunity_id,active_reasoning_snapshot_id) values('beta-workflow','73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','Decision',array['Blueprint','Opportunity','Reasoning'],'75000000-0000-4000-8000-000000000002','76000000-0000-4000-8000-000000000002','77000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','72000000-0000-4000-8000-000000000002',true);
select public.finalize_beta_decision('{"workspaceId":"73000000-0000-4000-8000-000000000001","blueprintRevisionId":"75000000-0000-4000-8000-000000000002","opportunityId":"76000000-0000-4000-8000-000000000002","opportunityVersion":1,"reasoningSnapshotId":"77000000-0000-4000-8000-000000000001","idempotencyKey":"78000000-0000-4000-8000-000000000001","selectedAction":"Monitor"}'::jsonb);
select public.finalize_beta_decision('{"workspaceId":"73000000-0000-4000-8000-000000000001","blueprintRevisionId":"75000000-0000-4000-8000-000000000002","opportunityId":"76000000-0000-4000-8000-000000000002","opportunityVersion":1,"reasoningSnapshotId":"77000000-0000-4000-8000-000000000001","idempotencyKey":"78000000-0000-4000-8000-000000000001","selectedAction":"Monitor"}'::jsonb);
do $$begin begin perform public.finalize_beta_decision('{"workspaceId":"73000000-0000-4000-8000-000000000001","blueprintRevisionId":"75000000-0000-4000-8000-000000000002","opportunityId":"76000000-0000-4000-8000-000000000002","opportunityVersion":2,"reasoningSnapshotId":"77000000-0000-4000-8000-000000000001","idempotencyKey":"78000000-0000-4000-8000-000000000002","selectedAction":"Apply"}'::jsonb);raise exception 'stale opportunity accepted';exception when serialization_failure then null;end;end$$;
reset role;
select 'decision_commits',count(*) from public.beta_decision_commits where workspace_id='73000000-0000-4000-8000-000000000001';
select 'decision_snapshots',count(*) from public.atlas_decision_snapshots where domain_id='beta-decision-78000000-0000-4000-8000-000000000001';
select 'ledger_events',count(*) from public.career_ledger_entries where domain_id='beta-decision-ledger-78000000-0000-4000-8000-000000000001';
select 'next_actions',count(*) from public.executive_tasks where domain_id='beta-next-action-78000000-0000-4000-8000-000000000001';
select 'partial_writes_after_failure',count(*) from public.beta_decision_commits where workspace_id='73000000-0000-4000-8000-000000000001' and idempotency_key='78000000-0000-4000-8000-000000000002';
rollback;`).trim().split("\n");

const counts = new Map(output.filter((line) => line.includes("|")).map((line) => { const [label, value] = line.split("|"); return [label, Number(value)]; }));
for (const label of ["accepted_invites", "decision_commits", "decision_snapshots", "ledger_events", "next_actions"]) if (counts.get(label) !== 1) throw new Error(`${label}: expected 1, got ${counts.get(label)}`);
if(counts.get("partial_writes_after_failure")!==0)throw new Error("Stale finalization produced a partial write");
pass("Beta workflow", "invitation acceptance/replay protection, stale-version rollback, and atomic idempotent finalization passed");
