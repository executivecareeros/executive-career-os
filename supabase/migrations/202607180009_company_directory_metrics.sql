begin;

create or replace function public.get_company_directory_metrics(target_workspace uuid)
returns jsonb
language sql
stable
security invoker
set search_path=public
as $$
  select case when public.is_active_workspace_member(target_workspace) then jsonb_build_object(
    'canonicalEmployers',(select count(*)::int from public.companies where workspace_id=target_workspace and archived_at is null and canonical_key is not null),
    'verifiedEmployers',(select count(*)::int from public.companies where workspace_id=target_workspace and archived_at is null and official_domain is not null and last_verified_at is not null and identity_confidence>=80),
    'hiringEmployers',(select count(distinct company_id)::int from public.opportunities where workspace_id=target_workspace and archived_at is null and company_id is not null and coalesce(status,'') not in ('Archived','Closed','Rejected')),
    'monitoredEmployerSources',(select count(*)::int from public.opportunity_provider_schedules where workspace_id=target_workspace and enabled)
  ) end
$$;

revoke all on function public.get_company_directory_metrics(uuid) from public,anon;
grant execute on function public.get_company_directory_metrics(uuid) to authenticated;

comment on function public.get_company_directory_metrics(uuid) is 'Workspace-isolated company directory and monitored-source counts; keeps collection coverage distinct from canonical hiring companies.';

commit;
