begin;

-- Remove the exact controlled-acceptance fixture from authenticated career memory.
-- The record is archived, not deleted, so audit history remains intact.
update public.professional_experiences
set archived_at = now(),
    version = version + 1
where archived_at is null
  and lower(trim(organization_name)) = 'aurora meridian group'
  and lower(trim(role_title)) = 'chief strategy officer'
  and notes ilike '%Fictional acceptance record:%';

commit;
