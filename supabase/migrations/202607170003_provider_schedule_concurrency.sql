begin;

create unique index opportunity_provider_jobs_one_active_schedule_idx
on public.opportunity_provider_jobs(schedule_id)
where schedule_id is not null and status in ('queued','running','retrying');

comment on index public.opportunity_provider_jobs_one_active_schedule_idx is
'Prevents duplicate scheduler triggers from creating concurrent active jobs for one provider schedule.';

commit;
