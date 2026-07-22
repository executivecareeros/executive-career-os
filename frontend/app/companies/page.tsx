import { CompaniesWorkspace } from "@/components/companies/companies-workspace";
import { companies } from "@/data/companies";
import { LiveCompanies, type LiveCompanyRecord } from "@/components/companies/live-companies";
import { resolveAuthenticatedRepositoryContext } from "@/lib/auth/repository-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { countNetworkCompanies, loadNetworkCompanies, loadNetworkCoverageMetrics } from "@/lib/opportunity-network";
import { canonicalCountry, countryFromExplicitLocation } from "@/lib/discovery/country-normalization";

type CountryRow = { code: string; canonical_name: string };

function intelligenceNumber(payload: Record<string, unknown> | undefined, field: string) {
  const intelligence = payload?.intelligence;
  if (!intelligence || typeof intelligence !== "object") return 0;
  const value = (intelligence as Record<string, unknown>)[field];
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export default async function CompaniesPage() {
  if (process.env.NEXT_PUBLIC_DATA_ACCESS_MODE !== "supabase") return <CompaniesWorkspace companies={companies}/>;
  const resolved = await resolveAuthenticatedRepositoryContext();
  if (!resolved) redirect("/login?next=/companies");
  const client = createServerSupabaseClient(resolved.accessToken);
  const [companyRows, canonicalEmployerCount, networkMetrics, countryResponse] = await Promise.all([
    loadNetworkCompanies({ hiringOnly: true }),
    countNetworkCompanies(),
    loadNetworkCoverageMetrics(),
    client.request<CountryRow[]>("world_country_registry?select=code,canonical_name&order=canonical_name.asc"),
  ]);
  const live: LiveCompanyRecord[] = companyRows.map((company) => {
    const opportunityCount = intelligenceNumber(company.payload, "activeOpportunities");
    const normalizedCountry = company.country?.trim().toLowerCase();
    const registeredCountry = countryResponse.data?.find(country => country.code.toLowerCase() === normalizedCountry || country.canonical_name.toLowerCase() === normalizedCountry);
    const evidencedCountry = registeredCountry?.canonical_name ?? canonicalCountry(company.country) ?? countryFromExplicitLocation(company.country);
    return {
      name: company.name,
      website: company.official_domain ? `https://${company.official_domain}` : undefined,
      careersUrl: company.careers_url,
      country: evidencedCountry,
      countryCode: registeredCountry?.code ?? countryResponse.data?.find(country => country.canonical_name === evidencedCountry)?.code,
      opportunityCount,
      executiveOpportunityCount: intelligenceNumber(company.payload, "executiveOpportunities"),
      sourceNames: company.ats_provider ? [company.ats_provider] : [],
      confidenceScores: company.identity_confidence > 0 ? [company.identity_confidence] : [],
      relevanceScores: [],
      lastObservedAt: company.last_observed_at,
    };
  }).filter((company) => company.opportunityCount > 0);
  return <LiveCompanies companies={live} canonicalEmployers={canonicalEmployerCount} hiringEmployers={networkMetrics?.employers} measuredAt={networkMetrics?.measuredAt}/>;
}
