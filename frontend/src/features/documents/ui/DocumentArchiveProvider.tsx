import {
  useState,
  type ReactNode,
} from "react";
import {
  DocumentArchiveContext,
} from "@/features/documents/model/DocumentArchiveContext";
import {
  initialWorkspaceDocuments,
  type WorkspaceDocument,
} from "@/features/documents/model/document";

type DocumentArchiveProviderProps = {
  children: ReactNode;
};

export function DocumentArchiveProvider({
  children,
}: DocumentArchiveProviderProps) {
  const [documents, setDocuments] = useState(
    [...initialWorkspaceDocuments].sort(
      (left, right) => left.position - right.position,
    ),
  );

  function addDocument(title: string) {
    setDocuments((current) => [
      ...current,
      {
        id: Date.now(),
        position: Math.max(
          0,
          ...current.map((document) => document.position),
        ) + 1,
        title,
        text: "",
      },
    ]);
  }

  function updateDocument(document: WorkspaceDocument) {
    setDocuments((current) => current.map((currentDocument) => (
      currentDocument.id === document.id
        ? document
        : currentDocument
    )));
  }

  function deleteDocument(documentId: number) {
    setDocuments((current) => current
      .filter((document) => document.id !== documentId)
      .map((document, index) => ({
        ...document,
        position: index + 1,
      })));
  }

  function reorderDocuments(orderedDocumentIds: number[]) {
    setDocuments((current) => {
      const documentsById = new Map(
        current.map((document) => [document.id, document]),
      );

      return orderedDocumentIds
        .map((documentId) => documentsById.get(documentId))
        .filter((document): document is WorkspaceDocument => Boolean(document))
        .map((document, index) => ({
          ...document,
          position: index + 1,
        }));
    });
  }

  return (
    <DocumentArchiveContext.Provider
      value={{
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        reorderDocuments,
      }}
    >
      {children}
    </DocumentArchiveContext.Provider>
  );
}
