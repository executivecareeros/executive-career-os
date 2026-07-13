begin;

create or replace function public.provision_founder_beta_workflow()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  insert into public.beta_workflow_states(domain_id,workspace_id,executive_identity_id,current_step,completed_steps)
  values('beta-workflow',new.workspace_id,new.identity_id,'Professional History',array['Registration','Verification','Onboarding'])
  on conflict(workspace_id,executive_identity_id) do nothing;
  return new;
end
$$;

drop trigger if exists founder_bootstrap_provision_beta_workflow on public.founder_bootstrap_audit_events;
create trigger founder_bootstrap_provision_beta_workflow
after insert on public.founder_bootstrap_audit_events
for each row execute function public.provision_founder_beta_workflow();

insert into public.beta_workflow_states(domain_id,workspace_id,executive_identity_id,current_step,completed_steps)
select 'beta-workflow',audit.workspace_id,audit.identity_id,'Professional History',array['Registration','Verification','Onboarding']
from public.founder_bootstrap_audit_events audit
on conflict(workspace_id,executive_identity_id) do nothing;

revoke all on function public.provision_founder_beta_workflow() from public,anon,authenticated;

commit;
