import { createContext } from 'react';
import type {
  Document,
  DocumentListItem,
  UpdateDocumentRequest,
} from '@/api/generated/models';

export type DocumentArchiveValue = {
  documents: DocumentListItem[];
  contents: Record<number, Document>;
  isLoading: boolean;
  error: string;
  addDocument: (title: string) => Promise<void>;
  updateDocument: (id: number, patch: UpdateDocumentRequest) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  reorderDocuments: (ids: number[]) => Promise<void>;
};
export const DocumentArchiveContext =
  createContext<DocumentArchiveValue | null>(null);
