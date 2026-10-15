import { useCallback, useState, type ReactNode } from 'react';
import * as api from '@/api/generated/api';
import { authenticatedRequest } from '@/api/authenticatedRequest';
import { requireStatus, useApiResource } from '@/api/useApiResource';
import type {
  CreateEssayRequest,
  UpdateEssayRequest,
  Essay,
} from '@/api/generated/models';
import { EssayArchiveContext } from '../model/EssayArchiveContext';
import { essayGroupKey } from '../model/essay';

export function EssayArchiveProvider({ children }: { children: ReactNode }) {
  const loader = useCallback(async (signal: AbortSignal) => {
    const response = await authenticatedRequest(api.getEssayGroups, { signal });
    if (response.status !== 200)
      throw new Error('ESグループを取得できませんでした。');
    const essaysByGroup: Record<string, Essay[]> = {};
    await Promise.all(
      response.data.essayGroups.map(async (group) => {
        const key = essayGroupKey(group.id);
        const essays = await authenticatedRequest(
          (options) => api.getEssaysByGroupId(key, options),
          { signal },
        );
        if (essays.status !== 200)
          throw new Error('ESを取得できませんでした。');
        essaysByGroup[key] = essays.data.essays;
      }),
    );
    return { groups: response.data.essayGroups, essaysByGroup };
  }, []);
  const resource = useApiResource(loader);
  // MOCK: OpenAPI has no operation for moving an essay between groups.
  // Keep only its display destination locally; edits/deletes still use its real API group.
  const [mockDestinations, setMockDestinations] = useState<
    Record<number, string>
  >({});
  const essaysByGroup: Record<string, Essay[]> = {};
  for (const [group, essays] of Object.entries(
    resource.data?.essaysByGroup ?? {},
  )) {
    for (const essay of essays) {
      const destination = mockDestinations[essay.id] ?? group;
      (essaysByGroup[destination] ??= []).push(essay);
    }
  }
  const groups =
    Object.keys(mockDestinations).length === 0
      ? (resource.data?.groups ?? [])
      : (resource.data?.groups ?? []).map((group) => ({
          ...group,
          quantity: essaysByGroup[essayGroupKey(group.id)]?.length ?? 0,
        }));
  function sourceGroup(id: number) {
    const source = Object.entries(resource.data?.essaysByGroup ?? {}).find(
      ([, essays]) => essays.some((essay) => essay.id === id),
    );
    if (!source) throw new Error('ESが見つかりません。');
    return source[0];
  }
  async function addEssay(groupId: string, request: CreateEssayRequest) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.createEssay(groupId, request, options),
      ),
      201,
    );
    await resource.refresh();
  }
  async function updateEssay(id: number, patch: UpdateEssayRequest) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.patchEssay(sourceGroup(id), id, patch, options),
      ),
    );
    await resource.refresh();
  }
  async function deleteEssay(id: number) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.deleteEssay(sourceGroup(id), id, options),
      ),
    );
    await resource.refresh();
  }
  async function addGroup(name: string) {
    requireStatus(
      await authenticatedRequest((options) =>
        api.createEssayGroup({ name }, options),
      ),
      201,
    );
    await resource.refresh();
  }
  async function updateGroup(id: number | null, name: string) {
    if (id === null) return;
    requireStatus(
      await authenticatedRequest((options) =>
        api.patchEssayGroup(String(id), { name }, options),
      ),
    );
    await resource.refresh();
  }
  async function deleteGroup(id: number | null) {
    if (id === null) return;
    requireStatus(
      await authenticatedRequest((options) =>
        api.deleteEssayGroup(String(id), options),
      ),
    );
    setMockDestinations((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([, target]) => target !== String(id)),
      ),
    );
    await resource.refresh();
  }
  async function reorderGroups(ids: (number | null)[]) {
    const managed = ids.filter((id) => id !== null);
    try {
      for (let index = managed.length - 1; index >= 0; index--) {
        requireStatus(
          await authenticatedRequest((options) =>
            api.reorderEssayGroup(
              String(managed[index]),
              { nextEssayGroupId: managed[index + 1] ?? null },
              options,
            ),
          ),
        );
      }
    } finally {
      await resource.refresh();
    }
  }
  return (
    <EssayArchiveContext.Provider
      value={{
        groups,
        essaysByGroup,
        isLoading: resource.isLoading,
        error: resource.error,
        addEssay,
        updateEssay,
        deleteEssay,
        moveEssay: (id, group) =>
          setMockDestinations((current) => ({ ...current, [id]: group })),
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
