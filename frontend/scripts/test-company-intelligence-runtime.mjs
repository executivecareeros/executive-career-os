import { psql, pass } from "./database-runtime.mjs";

const companyId = "70000000-0000-4000-8000-000000000001";
const values = psql(`begin;
insert into public.companies(id,domain_id,workspace_id,name,canonical_key,official_domain,identity_confidence,payload,created_by)
select '${companyId}','runtime-company-intelligence',id,'Runtime Company','runtime-company-intelligence','runtime.example',95,'{}',owner_identity_id
from public.workspaces order by created_at limit 1;
select set_config('app.runtime_workspace',(select workspace_id::text from public.companies where id='${companyId}'),true);
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
select public.persist_company_intelligence_observation(
  current_setting('app.runtime_workspace')::uuid,'${companyId}','https://runtime.example/',
  '2026-07-18T10:00:00Z','official-company-facts-v1:runtime',
  '[{"field":"overview","value":"Verified runtime overview","sourceUrl":"https://runtime.example/","sourceType":"Schema.org","observedAt":"2026-07-18T10:00:00Z","confidence":95}]'::jsonb
);
reset role;
select version from public.companies where id='${companyId}';
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
select public.persist_company_intelligence_observation(
  current_setting('app.runtime_workspace')::uuid,'${companyId}','https://runtime.example/',
  '2026-07-18T10:00:00Z','official-company-facts-v1:runtime',
  '[{"field":"overview","value":"Verified runtime overview","sourceUrl":"https://runtime.example/","sourceType":"Schema.org","observedAt":"2026-07-18T10:00:00Z","confidence":95}]'::jsonb
);
reset role;
select version from public.companies where id='${companyId}';
select count(*) from public.company_intelligence_observations where company_id='${companyId}';
select count(*) from public.companies where id='${companyId}' and payload#>>'{companyIntelligence,facts,0,value}'='Verified runtime overview';
do $$begin
  begin update public.company_intelligence_observations set facts=facts where company_id='${companyId}';raise exception 'append-only update accepted';exception when sqlstate '55000' then null;end;
  begin delete from public.company_intelligence_observations where company_id='${companyId}';raise exception 'append-only delete accepted';exception when sqlstate '55000' then null;end;
end$$;
rollback;`).trim().split("\n");

const numbers = values.filter((line) => /^\d+$/.test(line)).map(Number);
if (numbers.slice(-4).join("/") !== "2/2/1/1") throw new Error(`Runtime company intelligence validation failed: ${numbers.join("/")}`);
pass("Company intelligence runtime", "append-only history, cache persistence, and replay idempotency passed");
