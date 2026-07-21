import type { Schema, Query } from 'mongoose';

export interface SoftDeleteDocument {
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

interface SoftDeleteQuery extends Query<unknown, SoftDeleteDocument> {
  includeDeleted?: boolean;
}

export function softDeletePlugin(schema: Schema): void {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: String, default: null },
  });

  schema.pre<SoftDeleteQuery>(/^find/, function excludeDeleted(next) {
    if (this.getOptions().includeDeleted || this.includeDeleted) {
      return next();
    }

    this.where({ deletedAt: null });
    next();
  });

  schema.methods.softDelete = async function softDelete(deletedBy?: string) {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    return this.save();
  };

  schema.methods.restore = async function restore() {
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };
}

export function activeFilter(workspaceId: string): Record<string, unknown> {
  return { workspaceId, deletedAt: null };
}
