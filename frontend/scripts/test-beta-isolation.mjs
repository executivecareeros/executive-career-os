import { psql, pass } from "./database-runtime.mjs";

const output=psql(`begin;
insert into public.executive_identities(id,auth_user_id,profile) values
('81000000-0000-4000-8000-000000000001','82000000-0000-4000-8000-000000000001','{"isDemo":true}'),
('81000000-0000-4000-8000-000000000002','82000000-0000-4000-8000-000000000002','{"isDemo":true}'),
('81000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000003','{"isDemo":true}');
insert into public.workspaces(id,owner_identity_id,name,workspace_type,created_by) values
('83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Fictional A','Personal','81000000-0000-4000-8000-000000000001'),
('83000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000003','Fictional B','Personal','81000000-0000-4000-8000-000000000003');
insert into public.workspace_memberships(id,workspace_id,executive_identity_id,role,status,created_by) values
(gen_random_uuid(),'83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Owner','Active','81000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','Executive','Active','81000000-0000-4000-8000-000000000001'),
(gen_random_uuid(),'83000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000003','Owner','Active','81000000-0000-4000-8000-000000000003');
insert into public.beta_feedback(id,domain_id,workspace_id,executive_identity_id,route,workflow_step,category,severity,description,product_version) values
(gen_random_uuid(),'feedback-a','83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','/beta-workflow','Reasoning','Trust Concern','High','Fictional feedback A','0.6'),
(gen_random_uuid(),'feedback-b','83000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000003','/beta-workflow','Blueprint','Friction','Low','Fictional feedback B','0.6');
insert into public.beta_lifecycle_requests(id,domain_id,workspace_id,executive_identity_id,request_type,retention_status) values
(gen_random_uuid(),'lifecycle-a','83000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000002','Export','Review Required'),
(gen_random_uuid(),'lifecycle-b','83000000-0000-4000-8000-000000000002','81000000-0000-4000-8000-000000000003','Deletion','Review Required');
set local role authenticated;
select set_config('request.jwt.claim.sub','82000000-0000-4000-8000-000000000002',true);
select 'executive_own_feedback',count(*) from public.beta_feedback;
select 'executive_own_lifecycle',count(*) from public.beta_lifecycle_requests;
select set_config('request.jwt.claim.sub','82000000-0000-4000-8000-000000000001',true);
select 'founder_workspace_feedback',count(*) from public.beta_feedback;
select 'founder_workspace_lifecycle',count(*) from public.beta_lifecycle_requests;
select set_config('request.jwt.claim.sub','82000000-0000-4000-8000-000000000003',true);
select 'cross_workspace_feedback',count(*) from public.beta_feedback where workspace_id='83000000-0000-4000-8000-000000000001';
reset role;rollback;`).trim().split("\n");
const values=new Map(output.filter(line=>line.includes("|")).map(line=>{const[label,value]=line.split("|");return[label,Number(value)]}));
const expected={executive_own_feedback:1,executive_own_lifecycle:1,founder_workspace_feedback:1,founder_workspace_lifecycle:1,cross_workspace_feedback:0};for(const[label,value]of Object.entries(expected))if(values.get(label)!==value)throw new Error(`${label}: expected ${value}, got ${values.get(label)}`);
pass("Beta isolation",Object.entries(expected).map(([key,value])=>`${key}=${value}`).join(", "));
