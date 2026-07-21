begin;

-- ORENDALIS is publicly available. Email-verified executives may provision
-- exactly one isolated personal workspace through the existing idempotent
-- function. Anonymous callers remain denied.
revoke all on function public.provision_personal_workspace(jsonb) from public, anon;
grant execute on function public.provision_personal_workspace(jsonb) to authenticated;

commit;
