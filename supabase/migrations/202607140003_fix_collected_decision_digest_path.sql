begin;

alter function public.finalize_collected_opportunity_decision(jsonb)
  set search_path = public, extensions;

commit;
