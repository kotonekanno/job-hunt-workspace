import { useContext } from "react";
import { EssayArchiveContext } from "@/features/essay/model/EssayArchiveContext";

export function useEssayArchive() {
  const archive = useContext(EssayArchiveContext);

  if (!archive) {
    throw new Error("useEssayArchive must be used within EssayArchiveProvider.");
  }

  return archive;
}
