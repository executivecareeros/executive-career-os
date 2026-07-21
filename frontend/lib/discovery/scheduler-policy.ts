const SOURCE_FAILURE_COOLDOWN_MINUTES = 7 * 24 * 60;

const later = (iso: string, minutes: number) => new Date(Date.parse(iso) + minutes * 60_000).toISOString();

export type FailureScheduleState = {
  cadence_minutes: number;
  last_success_at: string | null;
  last_failure_at: string | null;
};

/**
 * A provider keeps its normal short retry window for the first failed cycle.
 * A second consecutive failed cycle yields scheduler capacity for seven days.
 */
export function failedScheduleNextRun(schedule: FailureScheduleState, now: string, providerRetryAt?: string) {
  const consecutiveCollectionFailure = Boolean(
    schedule.last_failure_at &&
    (!schedule.last_success_at || Date.parse(schedule.last_failure_at) > Date.parse(schedule.last_success_at)),
  );
  if (consecutiveCollectionFailure) return later(now, Math.max(schedule.cadence_minutes, SOURCE_FAILURE_COOLDOWN_MINUTES));
  return providerRetryAt ?? later(now, schedule.cadence_minutes);
}
