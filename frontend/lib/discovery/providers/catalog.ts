import type { OpportunityProvider, OpportunityProviderAdapter } from "../types";

export class OpportunityProviderCatalog {
  private readonly adapters = new Map<string, OpportunityProviderAdapter>();

  constructor(adapters: readonly OpportunityProviderAdapter[] = []) {
    for (const adapter of adapters) this.register(adapter);
  }

  register(adapter: OpportunityProviderAdapter) {
    if (this.adapters.has(adapter.id)) throw new Error(`Provider adapter already registered: ${adapter.id}`);
    this.adapters.set(adapter.id, adapter);
    return this;
  }

  list() {
    return [...this.adapters.values()];
  }

  resolve(locator: string): OpportunityProvider {
    let url: URL;
    try { url = new URL(locator.trim()); } catch { throw new Error("Enter a valid company careers URL."); }
    if (url.protocol !== "https:") throw new Error("Only secure company careers URLs are supported.");
    const adapter = this.list().find((candidate) => candidate.evaluation.reviewStatus === "approved" && candidate.supports(url));
    if (!adapter) throw new Error("This source is not available yet. Orendalis continuously reviews additional opportunity ecosystems.");
    return adapter.create(locator);
  }
}
