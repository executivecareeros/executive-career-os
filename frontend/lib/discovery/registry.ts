import type { DiscoverySourceKind, OpportunityProvider } from "./types";

export class OpportunityProviderRegistry {
  private readonly providers = new Map<DiscoverySourceKind, OpportunityProvider>();

  register(provider: OpportunityProvider) {
    if (this.providers.has(provider.id)) throw new Error(`Provider already registered: ${provider.id}`);
    if (provider.source.id !== provider.id) throw new Error(`Provider source mismatch: ${provider.id}`);
    this.providers.set(provider.id, provider);
    return this;
  }

  get(id: DiscoverySourceKind) {
    const provider = this.providers.get(id);
    if (!provider) throw new Error(`Provider not registered: ${id}`);
    return provider;
  }

  list() {
    return [...this.providers.values()];
  }
}
