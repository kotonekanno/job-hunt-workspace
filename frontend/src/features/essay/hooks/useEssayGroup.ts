import { useOptimisticState, temporaryId } from '@/shared/useOptimisticState';
import { useEffect, useRef, useState } from 'react';
import type { Essay } from '@/api/generated/models/essay';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { UpdateEssayRequest } from '@/api/generated/models/updateEssayRequest';
import {
  adjustGroupCount,
  addEssayRequest,
  deleteEssayRequest,
  EssayLoadError,
  groupPathId,
  loadEssayCompanies,
  loadEssayGroups,
  loadGroupEssays,
  moveEssayRequest,
  updateEssayRequest,
  type EssayForm,
} from '@/features/essay/lib/essayGroupsApi';

export function useEssayGroup(groupId: string | undefined) {
  const state = useOptimisticState<{
    essays: Essay[];
    groups: EssayGroupListItem[];
  }>({ essays: [], groups: [] });
  const { essays, groups } = state.value;
  const { setValue } = state;
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'missing' | 'error'
  >(groupId ? 'loading' : 'missing');
  const mounted = useRef(false);
  const ready = useRef(false);

  useEffect(() => {
    if (!groupId) return;
    const controller = new AbortController();
    mounted.current = true;
    void Promise.all([
      loadGroupEssays(groupId, controller.signal),
      loadEssayGroups(controller.signal),
      loadEssayCompanies(controller.signal),
    ])
      .then(([essays, groups, companies]) => {
        if (controller.signal.aborted) return;
        setValue({ essays, groups });
        setCompanies(companies);
        ready.current = true;
        setStatus('ready');
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setStatus(
          error instanceof EssayLoadError && error.status === 404
            ? 'missing'
            : 'error',
        );
      });
    return () => {
      mounted.current = false;
      ready.current = false;
      controller.abort();
    };
  }, [groupId, setValue]);

  return {
    essays,
    groups,
    status,
    groupName:
      groupId === 'unclassified'
        ? '未分類'
        : groups.find((group) => groupPathId(group.id) === groupId)?.name,
    groupOptions: [
      ...groups.map((group) => ({
        id: groupPathId(group.id),
        name: group.name,
      })),
      ...(groups.some((group) => group.id === null)
        ? []
        : [{ id: 'unclassified', name: '未分類' }]),
    ],
    companyOptions: [...new Set(companies.map((company) => company.name))],
    addEssay: (form: EssayForm) => {
      if (!ready.current || !groupId) return Promise.resolve(false);
      const id = temporaryId();
      return state.mutate(
        (current) => ({
          groups: adjustGroupCount(current.groups, form.groupId, 1),
          essays:
            form.groupId === groupId
              ? [
                  ...current.essays,
                  {
                    id,
                    question: form.question,
                    answer: form.answer,
                    companyName: form.company || null,
                  },
                ]
              : current.essays,
        }),
        () => addEssayRequest(form, groups, companies),
        (current, savedId) => ({
          ...current,
          essays: current.essays.map((essay) =>
            essay.id === id ? { ...essay, id: savedId } : essay,
          ),
        }),
      );
    },
    updateEssay: (id: number, request: UpdateEssayRequest) => {
      if (!ready.current || !groupId || id < 0) return Promise.resolve(false);
      return state.mutate(
        (current) => ({
          ...current,
          essays: current.essays.map((essay) =>
            essay.id === id
              ? {
                  ...essay,
                  question: request.question ?? essay.question,
                  answer: request.answer ?? essay.answer,
                  companyName:
                    request.companyId === undefined
                      ? essay.companyName
                      : request.companyId === null
                        ? null
                        : (companies.find(
                            (company) => company.id === request.companyId,
                          )?.name ?? essay.companyName),
                }
              : essay,
          ),
        }),
        () => updateEssayRequest(groupId, id, request),
      );
    },
    deleteEssay: (id: number) => {
      if (!ready.current || !groupId || id < 0) return Promise.resolve(false);
      return state.mutate(
        (current) => ({
          essays: current.essays.filter((essay) => essay.id !== id),
          groups: adjustGroupCount(current.groups, groupId, -1),
        }),
        () => deleteEssayRequest(groupId, id),
      );
    },
    moveEssay: (essay: Essay, nextGroupId: string) => {
      if (!ready.current || !groupId || essay.id < 0)
        return Promise.resolve(false);
      if (groupId === nextGroupId) return Promise.resolve(true);
      return state.mutate(
        (current) => ({
          essays: current.essays.filter((item) => item.id !== essay.id),
          groups: adjustGroupCount(
            adjustGroupCount(current.groups, groupId, -1),
            nextGroupId,
            1,
          ),
        }),
        () => moveEssayRequest(groupId, essay.id, nextGroupId, groups),
      );
    },
  };
}
