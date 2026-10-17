import { createContext } from 'react';
import type { Document } from '@/api/generated/models/document';
import type { DocumentListItem } from '@/api/generated/models/documentListItem';

export type DocumentArchiveValue = {
  documents: DocumentListItem[];
  contents: ReadonlyMap<number, Document>;
  dirtyIds: ReadonlySet<number>;
  savingIds: ReadonlySet<number>;
  saveDocument: (id: number) => Promise<boolean>;
  hasUnsavedDocument: (id: number) => boolean;
  loadDocuments: () => Promise<void>;
  loadDocument: (id: number) => Promise<Document>;
  addDocument: (title: string) => Promise<boolean>;
  updateDocument: (id: number, text: string) => void;
  deleteDocument: (id: number) => Promise<boolean>;
  reorderDocuments: (ids: number[]) => void;
};

export const DocumentArchiveContext =
  createContext<DocumentArchiveValue | null>(null);
