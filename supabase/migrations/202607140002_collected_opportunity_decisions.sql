begin;

create unique index beta_decision_commits_collected_opportunity_unique
  on public.beta_decision_commits(workspace_id,opportunity_id)
  where domain_id like 'collected-decision-%';

create or replace function public.finalize_collected_opportunity_decision(request jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  ws uuid := (request->>'workspaceId')::uuid;
  target_opportunity uuid := (request->>'opportunityId')::uuid;
  blueprint_revision uuid := (request->>'blueprintRevisionId')::uuid;
  expected_version integer := (request->>'opportunityVersion')::integer;
  idem uuid := (request->>'idempotencyKey')::uuid;
  executive_action text := request->>'selectedAction';
  stored_action text;
  identity uuid;
  opportunity_row public.opportunities%rowtype;
  existing public.beta_decision_commits%rowtype;
  correlation uuid := gen_random_uuid();
  reasoning_id uuid := gen_random_uuid();
  decision_id uuid := gen_random_uuid();
  ledger_id uuid := gen_random_uuid();
  task_id uuid := gen_random_uuid();
  commit_id uuid := gen_random_uuid();
  next_sequence bigint;
  intelligence jsonb := coalesce(request->'intelligence','{}'::jsonb);
  now_at timestamptz := now();
begin
  if not public.is_active_workspace_member(ws) then raise exception 'Workspace access denied' using errcode='42501'; end if;
  if executive_action not in ('Pursue','Watch','Skip') then raise exception 'Unsupported executive action' using errcode='22023'; end if;
  stored_action := case executive_action when 'Pursue' then 'Apply' when 'Watch' then 'Monitor' else 'Reject' end;
  select id into identity from public.executive_identities where auth_user_id=auth.uid();
  if identity is null then raise exception 'Executive identity missing' using errcode='42501'; end if;

  perform pg_advisory_xact_lock(hashtextextended(ws::text,0));
  select * into existing from public.beta_decision_commits where workspace_id=ws and idempotency_key=idem;
  if existing.id is not null then return jsonb_build_object('commitId',existing.id,'status','Already Finalized'); end if;
  select * into existing from public.beta_decision_commits where workspace_id=ws and opportunity_id=target_opportunity and domain_id like 'collected-decision-%';
  if existing.id is not null then return jsonb_build_object('commitId',existing.id,'status','Already Finalized'); end if;

  select * into opportunity_row from public.opportunities where workspace_id=ws and id=target_opportunity and archived_at is null for update;
  if opportunity_row.id is null or opportunity_row.domain_id not like 'discovered-%' then raise exception 'Canonical collected opportunity missing' using errcode='23503'; end if;
  if opportunity_row.version<>expected_version then raise exception 'Opportunity version is stale' using errcode='40001'; end if;
  if not exists(select 1 from public.executive_blueprint_revisions where workspace_id=ws and id=blueprint_revision) then raise exception 'Active Blueprint revision missing' using errcode='23503'; end if;
  if intelligence->>'opportunityId'<>opportunity_row.domain_id or intelligence->>'blueprintRevisionId'<>blueprint_revision::text then raise exception 'Intelligence references do not match current records' using errcode='23503'; end if;

  select coalesce(max(sequence_number),0)+1 into next_sequence from public.atlas_reasoning_snapshots where workspace_id=ws;
  insert into public.atlas_reasoning_snapshots(id,domain_id,workspace_id,subject_id,subject_type,sequence_number,occurred_at,correlation_id,input_hash,engine_version,rules_version,payload,created_by)
  values(reasoning_id,'collected-intelligence-'||idem,ws,opportunity_row.domain_id,'Opportunity',next_sequence,now_at,correlation,encode(digest((opportunity_row.payload::text||blueprint_revision::text),'sha256'),'hex'),'deterministic-opportunity-intelligence-1','opportunity-intelligence-1',intelligence||jsonb_build_object('opportunityRevision',opportunity_row.version,'blueprintRevisionId',blueprint_revision,'selectedAction',executive_action,'snapshotCreatedAt',now_at,'immutable',true),identity);

  select coalesce(max(sequence_number),0)+1 into next_sequence from public.atlas_decision_snapshots where workspace_id=ws;
  insert into public.atlas_decision_snapshots(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,payload,created_by)
  values(decision_id,'collected-decision-snapshot-'||idem,ws,next_sequence,now_at,correlation,jsonb_build_object('selectedAction',executive_action,'storedAction',stored_action,'reasoningSnapshotId',reasoning_id,'blueprintRevisionId',blueprint_revision,'opportunityId',opportunity_row.id,'canonicalOpportunityId',opportunity_row.domain_id,'finalizedAt',now_at),identity);

  select coalesce(max(sequence_number),0)+1 into next_sequence from public.career_ledger_entries where workspace_id=ws;
  insert into public.career_ledger_entries(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,causation_id,payload,created_by)
  values(ledger_id,'collected-decision-ledger-'||idem,ws,next_sequence,now_at,correlation,decision_id,jsonb_build_object('eventType','Opportunity Decision Finalized','selectedAction',executive_action,'decisionSnapshotId',decision_id,'canonicalOpportunityId',opportunity_row.domain_id,'opportunityTitle',opportunity_row.title,'companyName',opportunity_row.payload->>'companyName'),identity);

  insert into public.executive_tasks(id,domain_id,workspace_id,title,priority,status,related_opportunity_id,related_decision_id,payload,created_by)
  values(task_id,'collected-next-action-'||idem,ws,case executive_action when 'Pursue' then 'Prepare next step for '||coalesce(opportunity_row.title,'opportunity') when 'Watch' then 'Review updates for '||coalesce(opportunity_row.title,'opportunity') else 'Decision recorded — no follow-up required' end,case executive_action when 'Pursue' then 'High' when 'Watch' then 'Medium' else 'Low' end,case executive_action when 'Skip' then 'Completed' else 'Open' end,opportunity_row.domain_id,decision_id::text,jsonb_build_object('source','Collected opportunity decision','selectedAction',executive_action),identity);

  insert into public.beta_decision_commits(id,domain_id,idempotency_key,workspace_id,executive_identity_id,blueprint_revision_id,opportunity_id,opportunity_version,reasoning_snapshot_id,decision_snapshot_id,ledger_entry_id,task_id,selected_action,correlation_id)
  values(commit_id,'collected-decision-'||opportunity_row.domain_id,idem,ws,identity,blueprint_revision,opportunity_row.id,opportunity_row.version,reasoning_id,decision_id,ledger_id,task_id,stored_action,correlation);

  update public.opportunities set status=case executive_action when 'Pursue' then 'Ready to Apply' when 'Watch' then 'Evaluating' else 'Archived' end,payload=opportunity_row.payload||jsonb_build_object('executiveDecision',jsonb_build_object('action',executive_action,'status','Finalized','finalizedAt',now_at,'decisionSnapshotId',decision_id,'reasoningSnapshotId',reasoning_id),'lifecycle',coalesce(opportunity_row.payload->'lifecycle','[]'::jsonb)||jsonb_build_array(jsonb_build_object('status',case executive_action when 'Pursue' then 'Ready to Apply' when 'Watch' then 'Evaluating' else 'Archived' end,'occurredAt',now_at,'reason','Executive finalized decision: '||executive_action,'source','Executive'))),updated_at=now_at,version=version+1 where id=opportunity_row.id and workspace_id=ws;

  insert into public.beta_workflow_audit_events(workspace_id,executive_identity_id,event_type,subject_type,subject_id,correlation_id,safe_metadata)
  values(ws,identity,'CollectedOpportunityDecisionFinalized','Opportunity',opportunity_row.id,correlation,jsonb_build_object('commitId',commit_id,'selectedAction',executive_action));
  return jsonb_build_object('commitId',commit_id,'status','Finalized','reasoningSnapshotId',reasoning_id,'decisionSnapshotId',decision_id,'ledgerEntryId',ledger_id,'taskId',task_id);
end$$;

revoke all on function public.finalize_collected_opportunity_decision(jsonb) from public,anon;
grant execute on function public.finalize_collected_opportunity_decision(jsonb) to authenticated;

commit;
