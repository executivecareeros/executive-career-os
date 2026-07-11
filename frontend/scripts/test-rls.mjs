import { psql, pass } from "./database-runtime.mjs";
const output = psql(`begin;
insert into public.executive_identities(id,auth_user_id,profile) values
('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000005','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000006','{"isDemo":true}'),
('10000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000007','{"isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Workspace A','Personal','10000000-0000-4000-8000-000000000001'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000005','Workspace B','Personal','10000000-0000-4000-8000-000000000005');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values
(gen_random_uuid(),'30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Owner','Active','10000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','Viewer','Active','10000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','Viewer','Active','10000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000004','Viewer','Invited','10000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000005','Owner','Active','10000000-0000-4000-8000-000000000005'),
(gen_random_uuid(),'30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000006','Viewer','Active','10000000-0000-4000-8000-000000000005');
insert into public.workspace_member_permissions(id,workspace_id,membership_id,permission_id,effect,created_by) select gen_random_uuid(),m.workspace_id,m.id,p.id,'Allow','10000000-0000-4000-8000-000000000001' from public.workspace_memberships m cross join public.workspace_permissions p where m.executive_identity_id='10000000-0000-4000-8000-000000000003' and p.permission_key='View Compensation';
insert into public.companies(id,domain_id,workspace_id,name,payload,created_by) values(gen_random_uuid(),'rls-company-a','30000000-0000-4000-8000-000000000001','A','{}','10000000-0000-4000-8000-000000000001'),(gen_random_uuid(),'rls-company-b','30000000-0000-4000-8000-000000000002','B','{}','10000000-0000-4000-8000-000000000005');
insert into public.compensation_records(id,domain_id,workspace_id,sequence_number,occurred_at,correlation_id,currency,payload,created_by) values(gen_random_uuid(),'rls-comp-a','30000000-0000-4000-8000-000000000001',1,now(),gen_random_uuid(),'GBP','{}','10000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000001',true);
select 'owner_a_companies',count(*) from public.companies where workspace_id='30000000-0000-4000-8000-000000000001';
select 'owner_a_cross',count(*) from public.companies where workspace_id='30000000-0000-4000-8000-000000000002';
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
select 'ordinary_compensation',count(*) from public.compensation_records where workspace_id='30000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000003',true);
select 'enabled_compensation',count(*) from public.compensation_records where workspace_id='30000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000004',true);
select 'invited_access',count(*) from public.companies where workspace_id='30000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000007',true);
select 'no_membership_access',count(*) from public.companies;
reset role;
select 'anonymous_access',case when has_table_privilege('anon','public.companies','select') then 1 else 0 end;
rollback;`).trim().split("\n");
const values = new Map(output.filter((line)=>line.includes("|")).map((line)=>{const[label,value]=line.split("|");return[label,Number(value)]}));
const expected={owner_a_companies:1,owner_a_cross:0,ordinary_compensation:0,enabled_compensation:1,invited_access:0,no_membership_access:0,anonymous_access:0};for(const[label,value]of Object.entries(expected))if(values.get(label)!==value)throw new Error(`${label}: expected ${value}, got ${values.get(label)}`);pass("RLS identity matrix",Object.entries(expected).map(([key,value])=>`${key}=${value}`).join(", "));
