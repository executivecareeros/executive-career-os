import { psql, pass } from "./database-runtime.mjs";

const output=psql(`begin;
insert into auth.users(id,email,email_confirmed_at) values
('92000000-0000-4000-8000-000000000001','fictional.founder@example.invalid',now()),
('92000000-0000-4000-8000-000000000002','fictional.executive@example.invalid',now()),
('96000000-0000-4000-8000-000000000001','invited.one@example.invalid',now());
insert into public.executive_identities(id,auth_user_id,profile) values
('91000000-0000-4000-8000-000000000001','92000000-0000-4000-8000-000000000001','{"preferredName":"Fictional Founder","isDemo":true}'),
('91000000-0000-4000-8000-000000000002','92000000-0000-4000-8000-000000000002','{"preferredName":"Fictional Executive","isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values
('93000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','Fictional Invitation Workspace','Personal','91000000-0000-4000-8000-000000000001');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values
('94000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000001','Owner','Active','91000000-0000-4000-8000-000000000001'),
('94000000-0000-4000-8000-000000000002','93000000-0000-4000-8000-000000000001','91000000-0000-4000-8000-000000000002','Executive','Active','91000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
create temporary table invitation_created as select * from public.create_beta_invitation('93000000-0000-4000-8000-000000000001','invited.one@example.invalid','Executive',now()+interval '7 days');
select 'create_invitation',count(*) from public.workspace_invitations where id=(select invitation_id from invitation_created) and status='Pending';
select 'founder_list',count(*) from public.list_beta_invitations('93000000-0000-4000-8000-000000000001');

do $$begin begin perform public.create_beta_invitation('93000000-0000-4000-8000-000000000001','INVITED.ONE@example.invalid','Executive',now()+interval '7 days');raise exception 'duplicate invitation created';exception when unique_violation then null;end;end$$;
select 'duplicate_pending_count',count(*) from public.workspace_invitations where workspace_id='93000000-0000-4000-8000-000000000001' and lower(invited_email)='invited.one@example.invalid' and status='Pending';

create temporary table invitation_revoked as select * from public.create_beta_invitation('93000000-0000-4000-8000-000000000001','revoked@example.invalid','Executive',now()+interval '7 days');
select public.revoke_beta_invitation(invitation_id) from invitation_revoked;
select 'revoked_invitation',count(*) from public.workspace_invitations where id=(select invitation_id from invitation_revoked) and status='Revoked' and revoked_at is not null;
do $$begin begin perform public.revoke_beta_invitation((select invitation_id from invitation_revoked));raise exception 'terminal invitation revoked twice';exception when sqlstate '55000' then null;end;end$$;

reset role;
insert into public.workspace_invitations(id,workspace_id,invited_email,intended_role,status,expires_at,created_by,token_digest)
values('95000000-0000-4000-8000-000000000001','93000000-0000-4000-8000-000000000001','expired@example.invalid','Executive','Pending',now()-interval '1 minute','91000000-0000-4000-8000-000000000001',encode(extensions.digest('expired-token','sha256'),'hex'));
set local role authenticated;
select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000001',true);
select count(*) from public.list_beta_invitations('93000000-0000-4000-8000-000000000001');
select 'expired_invitation',count(*) from public.workspace_invitations where id='95000000-0000-4000-8000-000000000001' and status='Expired';

select set_config('request.jwt.claim.sub','92000000-0000-4000-8000-000000000002',true);
do $$begin begin perform public.list_beta_invitations('93000000-0000-4000-8000-000000000001');raise exception 'unauthorized invitation list succeeded';exception when insufficient_privilege then null;end;end$$;
do $$begin begin perform public.create_beta_invitation('93000000-0000-4000-8000-000000000001','unauthorized@example.invalid','Executive',now()+interval '1 day');raise exception 'unauthorized invitation creation succeeded';exception when insufficient_privilege then null;end;end$$;
do $$begin begin perform public.revoke_beta_invitation((select invitation_id from invitation_created));raise exception 'unauthorized invitation revocation succeeded';exception when insufficient_privilege then null;end;end$$;
select 'unauthorized_writes',count(*) from public.workspace_invitations where invited_email='unauthorized@example.invalid';

select set_config('request.jwt.claim.sub','96000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"96000000-0000-4000-8000-000000000001","email":"invited.one@example.invalid"}',true);
select public.accept_beta_invitation(invite_token) from invitation_created;
do $$declare token text:=(select invite_token from invitation_created);begin begin perform public.accept_beta_invitation(token);raise exception 'invitation replay accepted';exception when sqlstate '55000' then null;end;end$$;
reset role;
select 'accepted_invitation',count(*) from public.workspace_invitations where id=(select invitation_id from invitation_created) and status='Accepted' and accepted_at is not null;
select 'accepted_audit',count(*) from public.beta_invitation_audit_events where invitation_id=(select invitation_id from invitation_created) and event_type='Accepted';
rollback;`).trim().split("\n");

const values=new Map(output.filter(line=>line.includes("|")).map(line=>{const[label,value]=line.split("|");return[label,Number(value)]}));
const expected={create_invitation:1,founder_list:1,duplicate_pending_count:1,revoked_invitation:1,expired_invitation:1,unauthorized_writes:0,accepted_invitation:1,accepted_audit:1};
for(const[label,value]of Object.entries(expected))if(values.get(label)!==value)throw new Error(`${label}: expected ${value}, got ${values.get(label)}`);
pass("Founder invitation management",Object.entries(expected).map(([key,value])=>`${key}=${value}`).join(", "));
