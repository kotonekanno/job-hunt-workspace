import { createContext } from "react";
import type {
  Essay,
  EssayGroup,
} from "@/features/essay/model/essay";

export type EssayArchiveValue = {
  essays: Essay[];
  groups: EssayGroup[];
  addEssay: (essay: Omit<Essay, "id">) => void;
  updateEssay: (essayId: number, essay: Omit<Essay, "id">) => void;
  deleteEssay: (essayId: number) => void;
  addGroup: (name: string) => EssayGroup;
  updateGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  reorderGroups: (orderedGroupIds: string[]) => void;
};

export const EssayArchiveContext = createContext<EssayArchiveValue | null>(null);
