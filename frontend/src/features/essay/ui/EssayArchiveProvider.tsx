import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as api from '@/api/generated/api';
import type {
  Essay,
  EssayGroupListItem,
  CreateEssayRequest,
  UpdateEssayRequest,
} from '@/api/generated/models';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { EssayArchiveContext } from '@/features/essay/model/EssayArchiveContext';
import {
  essayGroupPath,
  unclassifiedEssayGroupId,
} from '@/features/essay/model/essay';

export function EssayArchiveProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [groups, setGroups] = useState<EssayGroupListItem[]>([]);
  const [essaysByGroup, setEssays] = useState<Map<string, Essay[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const reordering = useRef(false);
  useEffect(() => {
    if (auth.status !== 'authenticated') {
      setGroups([]);
      setEssays(new Map());
      return;
    }
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    async function load() {
      try {
        const response = await authenticatedRequest(
          (options) => api.getEssayGroups(options),
          { signal: controller.signal },
        );
        if (response.status !== 200) throw new Error();
        if (!controller.signal.aborted) setGroups(response.data.essayGroups);
      } catch {
        if (!controller.signal.aborted)
          setError('ESグループを取得できませんでした。');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [auth.status]);
  const loadEssays = useCallback(
    async (groupId: string, signal?: AbortSignal) => {
      const response = await authenticatedRequest(
        (options) => api.getEssaysByGroupId(groupId, options),
        { signal },
      );
      if (response.status !== 200)
        throw new Error('ES一覧を取得できませんでした。');
      if (signal?.aborted) return;
      setEssays((current) =>
        new Map(current).set(groupId, response.data.essays),
      );
      setGroups((current) =>
        current.map((group) =>
          essayGroupPath(group.id) === groupId
            ? { ...group, quantity: response.data.essays.length }
            : group,
        ),
      );
    },
    [],
  );
  async function perform(operation: () => Promise<void>) {
    setError('');
    try {
      await operation();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'ESを更新できませんでした。',
      );
      throw cause;
    }
  }
  async function addEssay(
    groupId: string,
    request: CreateEssayRequest,
    companyName?: string,
  ) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.createEssay(groupId, request, options),
      );
      if (response.status !== 201)
        throw new Error('ESを追加できませんでした。');
      const essay: Essay = {
        id: response.data.essayId,
        question: request.question,
        answer: request.answer,
        companyName: companyName ?? null,
      };
      setEssays((current) =>
        new Map(current).set(groupId, [essay, ...(current.get(groupId) ?? [])]),
      );
      setGroups((current) =>
        current.map((group) =>
          essayGroupPath(group.id) === groupId
            ? { ...group, quantity: group.quantity + 1 }
            : group,
        ),
      );
    });
  }
  async function updateEssay(
    groupId: string,
    id: number,
    patch: UpdateEssayRequest,
  ) {
    if (!Object.keys(patch).length) return;
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.patchEssay(groupId, id, patch, options),
      );
      if (response.status !== 204)
        throw new Error('ESを保存できませんでした。');
      if (patch.companyId !== undefined) {
        await loadEssays(groupId);
        return;
      }
      setEssays((current) =>
        new Map(current).set(
          groupId,
          (current.get(groupId) ?? []).map((essay) =>
            essay.id === id
              ? {
                  ...essay,
                  question: patch.question ?? essay.question,
                  answer: patch.answer ?? essay.answer,
                }
              : essay,
          ),
        ),
      );
    });
  }
  async function deleteEssay(groupId: string, id: number) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.deleteEssay(groupId, id, options),
      );
      if (response.status !== 204)
        throw new Error('ESを削除できませんでした。');
      setEssays((current) =>
        new Map(current).set(
          groupId,
          (current.get(groupId) ?? []).filter((essay) => essay.id !== id),
        ),
      );
      setGroups((current) =>
        current.map((group) =>
          essayGroupPath(group.id) === groupId
            ? { ...group, quantity: Math.max(0, group.quantity - 1) }
            : group,
        ),
      );
    });
  }
  async function addGroup(name: string) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.createEssayGroup({ name }, options),
      );
      if (response.status !== 201)
        throw new Error('ジャンルを追加できませんでした。');
      const group = { id: response.data.essayGroupId, name, quantity: 0 };
      setGroups((current) => [
        ...current.filter((item) => item.id !== null),
        group,
        ...current.filter((item) => item.id === null),
      ]);
    });
  }
  async function updateGroup(groupId: string, name: string) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.patchEssayGroup(groupId, { name }, options),
      );
      if (response.status !== 204)
        throw new Error('ジャンル名を保存できませんでした。');
      setGroups((current) =>
        current.map((group) =>
          essayGroupPath(group.id) === groupId ? { ...group, name } : group,
        ),
      );
    });
  }
  async function deleteGroup(groupId: string) {
    if (groupId === unclassifiedEssayGroupId) return;
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.deleteEssayGroup(groupId, options),
      );
      if (response.status !== 204)
        throw new Error('ジャンルを削除できませんでした。');
      const removed = groups.find(
        (group) => essayGroupPath(group.id) === groupId,
      );
      setGroups((current) =>
        current
          .filter((group) => essayGroupPath(group.id) !== groupId)
          .map((group) =>
            group.id === null
              ? {
                  ...group,
                  quantity: group.quantity + (removed?.quantity ?? 0),
                }
              : group,
          ),
      );
      setEssays((current) => {
        const next = new Map(current);
        next.delete(groupId);
        next.delete(unclassifiedEssayGroupId);
        return next;
      });
    });
  }
  async function reorderGroups(ids: number[]) {
    if (reordering.current) throw new Error('並べ替えを保存中です。');
    reordering.current = true;
    try {
      await perform(async () => {
        const working = groups.flatMap((group) =>
          group.id === null ? [] : [group.id],
        );
        for (let index = ids.length - 1; index >= 0; index--) {
          const id = ids[index],
            next = ids[index + 1] ?? null;
          const oldIndex = working.indexOf(id);
          if (oldIndex < 0 || (working[oldIndex + 1] ?? null) === next)
            continue;
          const response = await authenticatedRequest((options) =>
            api.reorderEssayGroup(
              String(id),
              { nextEssayGroupId: next },
              options,
            ),
          );
          if (response.status !== 204) {
            const actual = await authenticatedRequest((options) =>
              api.getEssayGroups(options),
            );
            if (actual.status === 200) setGroups(actual.data.essayGroups);
            throw new Error('ジャンルの並べ替えを保存できませんでした。');
          }
          working.splice(oldIndex, 1);
          working.splice(
            next === null ? working.length : working.indexOf(next),
            0,
            id,
          );
        }
        setGroups((current) => [
          ...ids.flatMap((id) => current.filter((group) => group.id === id)),
          ...current.filter((group) => group.id === null),
        ]);
      });
    } finally {
      reordering.current = false;
    }
  }
  return (
    <EssayArchiveContext.Provider
      value={{
        groups,
        essaysByGroup,
        isLoading,
        error,
        loadEssays,
        addEssay,
        updateEssay,
        deleteEssay,
        addGroup,
        updateGroup,
        deleteGroup,
        reorderGroups,
      }}
    >
      {children}
    </EssayArchiveContext.Provider>
  );
}
