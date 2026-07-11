import type { RepositoryContext } from "../types";
import type { SupabaseRow } from "../../supabase/types";

export interface SupabaseMapper<T> {
  toDomain(row: SupabaseRow): T;
  toInsert(entity: T, context: RepositoryContext): Readonly<Record<string, unknown>>;
  toUpdate(changes: Partial<T>): Readonly<Record<string, unknown>>;
}

export function jsonPayloadMapper<T extends { id: string }>(): SupabaseMapper<T> {
  return {
    toDomain(row) {
      return { ...(row.payload as T), id: row.domain_id };
    },
    toInsert(entity, context) {
      const { id, ...payload } = entity;
      return {
        domain_id: id,
        workspace_id: context.workspace!.workspaceId,
        payload,
        created_by: context.workspace!.executiveId,
      };
    },
    toUpdate(changes) {
      return { payload: changes, updated_at: new Date().toISOString() };
    },
  };
}
