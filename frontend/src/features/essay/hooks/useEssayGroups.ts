import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import { useEffect, useRef, useState } from 'react';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import {
  adjustGroupCount,
  addEssayGroupRequest,
  addEssayRequest,
  deleteEssayGroupRequest,
  loadEssayCompanies,
  loadEssayGroups,
  saveEssayGroupOrder,
  updateEssayGroupRequest,
  type EssayForm,
} from '@/features/essay/lib/essayGroupsApi';
import { toast } from '@/shared/toast';

export function useEssayGroups() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const state = useOptimisticState<EssayGroupListItem[]>([]);
  const { value: groups, setValue: setGroups } = state;
  const createdEssayIds = useRef(new Map<number, string>());
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const ready = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    mounted.current = true;
    ready.current = false;
    void Promise.all([
      loadEssayGroups(controller.signal),
      loadEssayCompanies(controller.signal),
    ])
      .then(([groups, companies]) => {
        if (controller.signal.aborted) return;
        setGroups(groups);
        setCompanies(companies);
        ready.current = true;
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadError(true);
        if (!controller.signal.aborted)
          toast.error(
            'ジャンル・企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [setGroups]);

  return {
    loading,
    loadError,
    groups,
    companyOptions: [...new Set(companies.map((company) => company.name))],
    addGroup: (name: string) => {
      if (!ready.current) return Promise.resolve(false);
      const id = temporaryId();
      return state.mutate(
        (items) => [
          ...items.filter((group) => group.id !== null),
          { id, name, quantity: 0 },
          ...items.filter((group) => group.id === null),
        ],
        () => addEssayGroupRequest(name),
        (items, savedId) =>
          items.map((group) =>
            group.id === id ? { ...group, id: savedId } : group,
          ),
      );
    },
    updateGroup: (id: number, name: string) =>
      !ready.current || id < 0
        ? Promise.resolve(false)
        : state.mutate(
            (items) =>
              items.map((group) =>
                group.id === id ? { ...group, name } : group,
              ),
            () => updateEssayGroupRequest(id, name),
          ),
    deleteGroup: (id: number) =>
      !ready.current || id < 0
        ? Promise.resolve(false)
        : state.mutate(
            (items) =>
              adjustGroupCount(
                items.filter((group) => group.id !== id),
                'unclassified',
                items.find((group) => group.id === id)?.quantity ?? 0,
              ),
            () => deleteEssayGroupRequest(id),
          ),
    addEssay: (form: EssayForm) =>
      !ready.current
        ? Promise.resolve(false)
        : state.mutate(
            (items) => adjustGroupCount(items, form.groupId, 1),
            () => addEssayRequest(form, groups, companies),
            (items, essayId) => {
              createdEssayIds.current.set(essayId, form.groupId);
              return items;
            },
          ),
    reorderGroups: (ids: number[], movedIds: number[]) => {
      if (!ready.current) return Promise.resolve(false);
      let confirmed = groups;
      return state.mutate(
        (items) => {
          const ordered = ids.flatMap((id) => {
            const group = items.find((group) => group.id === id);
            return group ? [group] : [];
          });
          return [...ordered, ...items.filter((group) => group.id === null)];
        },
        () =>
          saveEssayGroupOrder(
            groups,
            ids,
            (saved) => {
              confirmed = [
                ...saved.flatMap((id) => {
                  const group = groups.find((group) => group.id === id);
                  return group ? [group] : [];
                }),
                ...groups.filter((group) => group.id === null),
              ];
            },
            movedIds,
          ),
        undefined,
        () => confirmed,
      );
    },
  };
}
