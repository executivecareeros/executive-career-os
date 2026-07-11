import type { CareerLedgerEntry, LedgerEventType } from "@/types/career-ledger";
export interface CareerLedgerRepository { append(entry: CareerLedgerEntry): Promise<void>; appendMany(entries: CareerLedgerEntry[]): Promise<void>; getById(id: string): Promise<CareerLedgerEntry | undefined>; list(): Promise<CareerLedgerEntry[]>; forEntity(id: string): Promise<CareerLedgerEntry[]>; byEvent(type: LedgerEventType): Promise<CareerLedgerEntry[]>; inRange(from: string, to: string): Promise<CareerLedgerEntry[]>; byCorrelation(id: string): Promise<CareerLedgerEntry[]>; archive(id: string, reason: string): Promise<CareerLedgerEntry>; restore(id: string): Promise<CareerLedgerEntry>; }
export class InMemoryCareerLedgerRepository implements CareerLedgerRepository {
  private entries: CareerLedgerEntry[];
  constructor(entries: CareerLedgerEntry[] = []) { this.entries = [...entries]; }
  async append(entry: CareerLedgerEntry) { if (this.entries.some((item) => item.id === entry.id)) throw new Error("Ledger IDs are immutable"); this.entries.push(entry); }
  async appendMany(entries: CareerLedgerEntry[]) { for (const entry of entries) await this.append(entry); }
  async getById(id: string) { return this.entries.find((entry) => entry.id === id); }
  async list() { return [...this.entries]; }
  async forEntity(id: string) { return this.entries.filter((entry) => entry.entityId === id || entry.relatedEntityIds.includes(id)); }
  async byEvent(type: LedgerEventType) { return this.entries.filter((entry) => entry.eventType === type); }
  async inRange(from: string, to: string) { return this.entries.filter((entry) => entry.occurredAt >= from && entry.occurredAt <= to); }
  async byCorrelation(id: string) { return this.entries.filter((entry) => entry.correlationId === id); }
  async archive(id: string, reason: string) { return this.appendArchiveState(id, true, reason); }
  async restore(id: string) { return this.appendArchiveState(id, false); }
  private async appendArchiveState(id: string, archived: boolean, reason?: string): Promise<CareerLedgerEntry> {
    const prior = await this.getById(id); if (!prior) throw new Error("Ledger entry not found");
    const next: CareerLedgerEntry = { ...prior, id: `${id}-${archived ? "archive" : "restore"}-${this.entries.length + 1}`, sequenceNumber: this.entries.length + 1, eventType: archived ? "Archived" : "Restored", previousValue: { isArchived: prior.isArchived }, newValue: { isArchived: archived }, isArchived: archived, archiveReason: reason, correctsEntryId: id, causationId: id };
    await this.append(next); return next;
  }
}
