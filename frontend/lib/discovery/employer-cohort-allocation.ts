export type ProviderCohortAllocation = {
  provider: string;
  target: number;
};

/**
 * Reserves discovery capacity for every approved provider before allowing a
 * high-volume source to consume the whole cohort. This improves unique
 * employer coverage without changing provider contracts or canonical identity.
 */
export function allocateProviderCohortTargets(
  total: number,
  providers: readonly string[],
): readonly ProviderCohortAllocation[] {
  const target = Math.max(0, Math.trunc(total));
  const uniqueProviders = [...new Set(providers.map((provider) => provider.trim()).filter(Boolean))];
  if (!target || !uniqueProviders.length) return [];

  const base = Math.floor(target / uniqueProviders.length);
  const remainder = target % uniqueProviders.length;
  return uniqueProviders.map((provider, index) => ({
    provider,
    target: base + (index < remainder ? 1 : 0),
  }));
}
