import { useEffect, useRef, useState } from 'react';
import type { Essay } from '@/api/generated/models/essay';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import type { UpdateEssayRequest } from '@/api/generated/models/updateEssayRequest';
import {
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
import { toast } from '@/shared/toast';

export function useEssayGroup(groupId: string | undefined) {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [groups, setGroups] = useState<EssayGroupListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [status, setStatus] = useState<
    'loading' | 'ready' | 'missing' | 'error'
  >(groupId ? 'loading' : 'missing');
  const mounted = useRef(false);
  const ready = useRef(false);
  const busy = useRef(false);

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
        setEssays(essays);
        setGroups(groups);
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
  }, [groupId]);

  async function mutate(action: () => Promise<void>) {
    if (!groupId || busy.current) return false;
    if (!ready.current) {
      toast.error('一覧を再読み込みしてから操作してください。');
      return false;
    }
    busy.current = true;
    try {
      await action();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '操作に失敗しました。',
      );
      busy.current = false;
      return false;
    }
    try {
      const [updated, updatedGroups] = await Promise.all([
        loadGroupEssays(groupId),
        loadEssayGroups(),
      ]);
      if (mounted.current) {
        setEssays(updated);
        setGroups(updatedGroups);
      }
    } catch {
      ready.current = false;
      toast.error(
        '更新は完了しましたが、一覧を再取得できませんでした。画面を再読み込みしてください。',
      );
    } finally {
      busy.current = false;
    }
    return true;
  }

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
    addEssay: (form: EssayForm) =>
      mutate(() => addEssayRequest(form, groups, companies)),
    updateEssay: (id: number, request: UpdateEssayRequest) =>
      mutate(async () => {
        if (groupId) await updateEssayRequest(groupId, id, request);
      }),
    deleteEssay: (id: number) =>
      mutate(async () => {
        if (groupId) await deleteEssayRequest(groupId, id);
      }),
    moveEssay: (essay: Essay, nextGroupId: string) =>
      mutate(async () => {
        if (groupId)
          await moveEssayRequest(groupId, essay.id, nextGroupId, groups);
      }),
  };
}
