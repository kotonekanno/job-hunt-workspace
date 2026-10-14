import { createContext } from 'react';
import type {
  Essay,
  EssayGroupListItem,
  CreateEssayRequest,
  UpdateEssayRequest,
} from '@/api/generated/models';

export type EssayArchiveValue = {
  groups: EssayGroupListItem[];
  essaysByGroup: Map<string, Essay[]>;
  isLoading: boolean;
  error: string;
  loadEssays: (groupId: string, signal?: AbortSignal) => Promise<void>;
  addEssay: (
    groupId: string,
    request: CreateEssayRequest,
    companyName?: string,
  ) => Promise<void>;
  updateEssay: (
    groupId: string,
    essayId: number,
    patch: UpdateEssayRequest,
  ) => Promise<void>;
  deleteEssay: (groupId: string, essayId: number) => Promise<void>;
  addGroup: (name: string) => Promise<void>;
  updateGroup: (groupId: string, name: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  reorderGroups: (ids: number[]) => Promise<void>;
};
export const EssayArchiveContext = createContext<EssayArchiveValue | null>(
  null,
);
