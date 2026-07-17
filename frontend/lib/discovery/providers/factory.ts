import type { OpportunityProvider, ProviderLocatorContext } from "../types";
import type { OpportunityProviderCatalog } from "./catalog.ts";
import { productionOpportunityProviderCatalog } from "./production-catalog.ts";

export function providerFromCareersUrl(locator: string, catalog: OpportunityProviderCatalog = productionOpportunityProviderCatalog, context?: ProviderLocatorContext): OpportunityProvider {
  return catalog.resolve(locator, context);
}
