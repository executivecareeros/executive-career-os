begin;

alter table public.companies add constraint companies_workspace_id_id_unique unique(workspace_id,id);
alter table public.opportunities add constraint opportunities_workspace_id_id_unique unique(workspace_id,id);
alter table public.applications add constraint applications_workspace_id_id_unique unique(workspace_id,id);

alter table public.opportunities add constraint opportunities_company_workspace_fk foreign key(workspace_id,company_id) references public.companies(workspace_id,id);
alter table public.applications add constraint applications_opportunity_workspace_fk foreign key(workspace_id,opportunity_id) references public.opportunities(workspace_id,id);
alter table public.applications add constraint applications_company_workspace_fk foreign key(workspace_id,company_id) references public.companies(workspace_id,id);
alter table public.compensation_records add constraint compensation_opportunity_workspace_fk foreign key(workspace_id,opportunity_id) references public.opportunities(workspace_id,id);
alter table public.compensation_records add constraint compensation_application_workspace_fk foreign key(workspace_id,application_id) references public.applications(workspace_id,id);
alter table public.compensation_records add constraint compensation_company_workspace_fk foreign key(workspace_id,company_id) references public.companies(workspace_id,id);

create index workspace_memberships_identity_active_idx on public.workspace_memberships(executive_identity_id,workspace_id) where status='Active' and archived_at is null;
create index executive_identities_auth_user_idx on public.executive_identities(auth_user_id) where auth_user_id is not null;
create index workspace_member_permissions_membership_idx on public.workspace_member_permissions(membership_id,permission_id) where effect='Allow';

do $$declare t text;begin foreach t in array array['executive_blueprints','executive_blueprint_revisions','blueprint_preferences','blueprint_constraints','blueprint_evidence','opportunities','opportunity_provenance','companies','applications','application_activities','application_documents','career_ledger_entries','compensation_records','atlas_decision_snapshots','knowledge_observations','knowledge_signals','discovery_runs','document_versions','workspace_settings','executive_settings','entitlement_usage'] loop execute format('create index %I on public.%I(workspace_id)',t||'_workspace_idx',t);end loop;end$$;
create index career_ledger_workspace_sequence_idx on public.career_ledger_entries(workspace_id,sequence_number desc);
create index blueprint_revision_workspace_sequence_idx on public.executive_blueprint_revisions(workspace_id,blueprint_id,revision_number desc);
create index atlas_snapshot_workspace_sequence_idx on public.atlas_decision_snapshots(workspace_id,sequence_number desc);
create index knowledge_observation_workspace_sequence_idx on public.knowledge_observations(workspace_id,sequence_number desc);
create index discovery_run_workspace_sequence_idx on public.discovery_runs(workspace_id,sequence_number desc);

-- PostgreSQL privileges are evaluated before RLS. Grant the application roles
-- only the verbs for which policies exist; RLS remains the workspace boundary.
grant select,insert,update on all tables in schema public to authenticated;
grant select on public.workspace_permissions to authenticated;
revoke delete on all tables in schema public from authenticated;
revoke all on all tables in schema public from anon;

commit;
