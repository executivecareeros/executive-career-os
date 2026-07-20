begin;

create index if not exists opportunities_workspace_company_active_idx
  on public.opportunities(workspace_id,company_id)
  where archived_at is null;

do $$
declare
  function_definition text;
  original_fragment text := $fragment$
    where opportunity.workspace_id=target_workspace and opportunity.archived_at is null
      and exists(
$fragment$;
  scoped_fragment text := $fragment$
    where opportunity.workspace_id=target_workspace and opportunity.archived_at is null
      and opportunity.company_id in (
        select company.id
        from public.companies company
        join (
          select distinct lower(trim(candidate->'company'->>'canonicalKey')) as canonical_key
          from jsonb_array_elements(items) candidate
        ) incoming_company on incoming_company.canonical_key=company.canonical_key
        where company.workspace_id=target_workspace and company.archived_at is null
      )
      and exists(
$fragment$;
begin
  select pg_get_functiondef('public.persist_opportunity_batch(uuid,uuid,text,text,timestamptz,jsonb)'::regprocedure)
    into function_definition;

  if position(scoped_fragment in function_definition)>0 then
    return;
  end if;
  if position(original_fragment in function_definition)=0 then
    raise exception 'persist_opportunity_batch reconciliation block no longer matches the reviewed definition';
  end if;

  execute replace(function_definition,original_fragment,scoped_fragment);
end
$$;

comment on index public.opportunities_workspace_company_active_idx is
  'Bounds canonical source reconciliation to the employers present in the incoming ingestion batch.';

commit;
