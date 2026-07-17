begin;

with evidenced_employers as (
  select distinct c.id
  from public.companies c
  join public.employer_source_observations s on s.company_id=c.id and s.workspace_id=c.workspace_id
  where c.archived_at is null
    and c.canonical_key is not null
    and s.provider_id='greenhouse'
    and nullif(s.source_employer_id,'') is not null
    and nullif(s.source_url,'') is not null
)
update public.companies c
set identity_confidence=greatest(c.identity_confidence,90),updated_at=now()
from evidenced_employers e
where c.id=e.id;

update public.employer_source_observations
set confidence=greatest(confidence,90),last_seen_at=greatest(last_seen_at,now())
where provider_id='greenhouse'
  and nullif(source_employer_id,'') is not null
  and nullif(source_url,'') is not null;

comment on column public.companies.identity_confidence is
  'Deterministic identity-resolution confidence. Exact Greenhouse board provenance is scored 90; it is not business-quality or employer-verification confidence.';

commit;
