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

function getCurrentDate() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
}

export function DocumentArchiveProvider({
  children,
}: DocumentArchiveProviderProps) {
  const [documents, setDocuments] = useState(initialWorkspaceDocuments);

  function addDocument(title: string) {
    setDocuments((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        updatedAt: getCurrentDate(),
        content: "",
      },
    ]);
  }

  function updateDocument(document: WorkspaceDocument) {
    setDocuments((current) => current.map((currentDocument) => (
      currentDocument.id === document.id
        ? { ...document, updatedAt: getCurrentDate() }
        : currentDocument
    )));
  }

  function deleteDocument(documentId: number) {
    setDocuments((current) => current.filter(
      (document) => document.id !== documentId,
    ));
  }

  function reorderDocuments(orderedDocumentIds: number[]) {
    setDocuments((current) => {
      const documentsById = new Map(
        current.map((document) => [document.id, document]),
      );

      return orderedDocumentIds
        .map((documentId) => documentsById.get(documentId))
        .filter((document): document is WorkspaceDocument => Boolean(document));
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
