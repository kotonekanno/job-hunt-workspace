import { createContext } from 'react';
import type {
  CreateEssayRequest,
  UpdateEssayRequest,
  Essay,
  EssayGroupListItem,
} from '@/api/generated/models';

export type EssayArchiveValue = {
  groups: EssayGroupListItem[];
  essaysByGroup: Record<string, Essay[]>;
  isLoading: boolean;
  error: string;
  addEssay: (groupId: string, request: CreateEssayRequest) => Promise<void>;
  updateEssay: (essayId: number, request: UpdateEssayRequest) => Promise<void>;
  deleteEssay: (essayId: number) => Promise<void>;
  moveEssay: (essayId: number, groupId: string) => void;
  addGroup: (name: string) => Promise<void>;
  updateGroup: (groupId: number | null, name: string) => Promise<void>;
  deleteGroup: (groupId: number | null) => Promise<void>;
  reorderGroups: (groupIds: (number | null)[]) => Promise<void>;
};
export const EssayArchiveContext = createContext<EssayArchiveValue | null>(
  null,
);
