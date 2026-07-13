import {psql,pass} from "./database-runtime.mjs";

const lines=psql(`begin;
insert into auth.users(id,email,email_confirmed_at) values
('a2000000-0000-4000-8000-000000000001','verification.founder@example.invalid',now()),
('a2000000-0000-4000-8000-000000000002','verification.pending@example.invalid',null),
('a2000000-0000-4000-8000-000000000003','verification.accepted@example.invalid',now()),
('a2000000-0000-4000-8000-000000000004','verification.mismatch@example.invalid',now()),
('a2000000-0000-4000-8000-000000000005','verification.expired@example.invalid',now()),
('a2000000-0000-4000-8000-000000000006','verification.revoked@example.invalid',now());
insert into public.executive_identities(id,auth_user_id,profile) values('a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','{"preferredName":"Verification Founder","isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values('a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Fictional Verification Workspace','Personal','a1000000-0000-4000-8000-000000000001');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values('a4000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','Owner','Active','a1000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000001',true);
create temporary table accepted_invite as select * from public.create_beta_invitation('a3000000-0000-4000-8000-000000000001','verification.accepted@example.invalid','Executive',now()+interval '1 day');
create temporary table revoked_invite as select * from public.create_beta_invitation('a3000000-0000-4000-8000-000000000001','verification.revoked@example.invalid','Executive',now()+interval '1 day');
select public.revoke_beta_invitation(invitation_id) from revoked_invite;
reset role;
insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest) values('a5000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000001','verification.inspection@example.invalid','Executive','Pending',now()+interval '1 day','a1000000-0000-4000-8000-000000000001',encode(extensions.digest('mismatch-inspection-token','sha256'),'hex'));
set local role anon;
select 'mismatch_inspection',count(*) from public.inspect_beta_invitation('wrong.address@example.invalid','mismatch-inspection-token') where invitation_status='Invalid';
reset role;
insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest) values('a5000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','verification.expired@example.invalid','Executive','Pending',now()-interval '1 minute','a1000000-0000-4000-8000-000000000001',encode(extensions.digest('expired-verification-token','sha256'),'hex'));
set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000002","email":"verification.pending@example.invalid"}',true);
do $$begin begin perform public.accept_beta_invitation((select invite_token from accepted_invite));raise exception 'unverified invitation accepted';exception when invalid_authorization_specification then null;end;end$$;
select 'unverified_acceptance',count(*) from public.workspace_invitations where id=(select invitation_id from accepted_invite) and status='Accepted';
do $$begin begin perform public.provision_invited_beta_workspace('{}');raise exception 'unverified workspace provisioned';exception when invalid_authorization_specification then null;end;end$$;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000004',true);
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000004","email":"verification.mismatch@example.invalid"}',true);
do $$begin begin perform public.accept_beta_invitation((select invite_token from accepted_invite));raise exception 'mismatched invitation accepted';exception when insufficient_privilege then null;end;end$$;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000005',true);
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000005","email":"verification.expired@example.invalid"}',true);
do $$begin begin perform public.accept_beta_invitation('expired-verification-token');raise exception 'expired invitation accepted';exception when invalid_datetime_format then null;end;end$$;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000006',true);
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000006","email":"verification.revoked@example.invalid"}',true);
do $$begin begin perform public.accept_beta_invitation((select invite_token from revoked_invite));raise exception 'revoked invitation accepted';exception when sqlstate '55000' then null;end;end$$;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"a2000000-0000-4000-8000-000000000003","email":"verification.accepted@example.invalid"}',true);
do $$begin begin perform public.accept_beta_invitation('invalid-verification-token');raise exception 'invalid token accepted';exception when invalid_parameter_value then null;end;end$$;
select public.accept_beta_invitation(invite_token) from accepted_invite;
do $$begin begin perform public.accept_beta_invitation((select invite_token from accepted_invite));raise exception 'verification replay accepted';exception when sqlstate '55000' then null;end;end$$;
select public.provision_invited_beta_workspace('{"preferredName":"Fictional Verified Executive","currentRole":"Chief Verification Officer","country":"Example Country","preferredLanguage":"English","timezone":"UTC","careerAmbition":"Validate secure invited access","atlasPromiseAccepted":true}');
select public.provision_invited_beta_workspace('{"preferredName":"Fictional Verified Executive","currentRole":"Chief Verification Officer","country":"Example Country","preferredLanguage":"English","timezone":"UTC","careerAmbition":"Validate secure invited access","atlasPromiseAccepted":true}');
reset role;
select 'accepted_once',count(*) from public.workspace_invitations where id=(select invitation_id from accepted_invite) and status='Accepted';
select 'verification_audit',count(*) from public.email_verification_audit_events where invitation_id=(select invitation_id from accepted_invite);
select 'workspace_once',count(*) from public.workspaces where owner_identity_id=(select id from public.executive_identities where auth_user_id='a2000000-0000-4000-8000-000000000003');
select 'workflow_once',count(*) from public.beta_workflow_states where executive_identity_id=(select id from public.executive_identities where auth_user_id='a2000000-0000-4000-8000-000000000003');
select 'expired_acceptance',count(*) from public.workspace_invitations where id='a5000000-0000-4000-8000-000000000001' and status='Accepted';
rollback;`).trim().split("\n");
const results=new Map(lines.filter(line=>line.includes("|")).map(line=>{const[k,v]=line.split("|");return[k,Number(v)]}));
const expected={mismatch_inspection:1,unverified_acceptance:0,expired_acceptance:0,accepted_once:1,verification_audit:1,workspace_once:1,workflow_once:1};
for(const[key,value]of Object.entries(expected))if(results.get(key)!==value)throw new Error(`${key}: expected ${value}, got ${results.get(key)}`);
pass("Email verification enforcement",Object.entries(expected).map(([key,value])=>`${key}=${value}`).join(", "));
