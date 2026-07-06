// packages/core/src/repositories/IDataRoomRepository.ts

import {
  DataRoomDocument,
  DocumentCategory,
} from "../entities/DataRoomDocument";

/**
 * Port: Data Room Repository Interface
 *
 * Defines the contract for Data Room document persistence and storage.
 * Implementations (Adapters) handle Prisma queries + Supabase Storage.
 */
export interface IDataRoomRepository {
  // === DOCUMENTS (metadata) ===

  /** Save document metadata after successful storage upload */
  save(document: DataRoomDocument): Promise<void>;

  /** Find a single document by ID within a tenant */
  findById(
    tenantId: string,
    documentId: string,
  ): Promise<DataRoomDocument | null>;

  /** List all documents for a tenant, optionally filtered by category */
  findByTenant(
    tenantId: string,
    filters?: DocumentListFilters,
  ): Promise<DataRoomDocument[]>;

  /** Delete document metadata */
  delete(tenantId: string, documentId: string): Promise<void>;

  // === STORAGE (file operations) ===

  /** Generate a signed upload URL for the client to PUT a file directly */
  createUploadUrl(
    storagePath: string,
    mimeType: string,
    expiresInSeconds?: number,
  ): Promise<UploadUrlResult>;

  /** Generate a signed download URL for secure, time-limited access */
  createDownloadUrl(
    storagePath: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  /** Remove a file from storage */
  deleteFile(storagePath: string): Promise<void>;
}

// === Filter / Result DTOs ===

export interface DocumentListFilters {
  category?: DocumentCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UploadUrlResult {
  signedUrl: string;
  storagePath: string;
  expiresAt: Date;
}
