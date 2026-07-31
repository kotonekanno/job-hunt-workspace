import { createContext } from "react";
import type { WorkspaceDocument } from "@/features/documents/model/document";

export type DocumentArchiveValue = {
  documents: WorkspaceDocument[];
  addDocument: (title: string) => void;
  updateDocument: (document: WorkspaceDocument) => void;
  deleteDocument: (documentId: number) => void;
  reorderDocuments: (orderedDocumentIds: number[]) => void;
};

export const DocumentArchiveContext = createContext<DocumentArchiveValue | null>(
  null,
);
