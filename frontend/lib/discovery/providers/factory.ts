import type { OpportunityProvider } from "../types";
import type { OpportunityProviderCatalog } from "./catalog.ts";
import { productionOpportunityProviderCatalog } from "./production-catalog.ts";

export function providerFromCareersUrl(locator: string, catalog: OpportunityProviderCatalog = productionOpportunityProviderCatalog): OpportunityProvider {
  return catalog.resolve(locator);
}
