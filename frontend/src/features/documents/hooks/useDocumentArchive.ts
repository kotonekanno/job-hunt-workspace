import { useContext } from "react";
import { DocumentArchiveContext } from "@/features/documents/model/DocumentArchiveContext";

export function useDocumentArchive() {
  const archive = useContext(DocumentArchiveContext);

  if (!archive) {
    throw new Error(
      "useDocumentArchive must be used within DocumentArchiveProvider.",
    );
  }

  return archive;
}
