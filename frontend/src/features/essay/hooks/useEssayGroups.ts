import { useEffect, useRef, useState } from 'react';
import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import {
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
  const [groups, setGroups] = useState<EssayGroupListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const ready = useRef(false);
  const busy = useRef(false);
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
        if (!controller.signal.aborted)
          toast.error(
            'ジャンル・企業一覧を取得できませんでした。画面を再読み込みしてください。',
          );
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, []);

  async function mutate(action: () => Promise<void>, recoverOrder = false) {
    if (busy.current) return false;
    if (!ready.current) {
      toast.error(
        '一覧の読み込みが完了していません。取得に失敗した場合は画面を再読み込みしてください。',
      );
      return false;
    }
    busy.current = true;
    let saved = false;
    try {
      await action();
      saved = true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '操作に失敗しました。',
      );
    }
    if (saved || recoverOrder) {
      try {
        const updated = await loadEssayGroups();
        if (mounted.current) setGroups(updated);
      } catch {
        ready.current = false;
        toast.error(
          '一覧を再取得できませんでした。操作結果を確認するため画面を再読み込みしてください。',
        );
      }
    }
    busy.current = false;
    return saved;
  }
  return {
    groups,
    companyOptions: [...new Set(companies.map((company) => company.name))],
    addGroup: (name: string) => mutate(() => addEssayGroupRequest(name)),
    updateGroup: (id: number, name: string) =>
      mutate(() => updateEssayGroupRequest(id, name)),
    deleteGroup: (id: number) => mutate(() => deleteEssayGroupRequest(id)),
    addEssay: (form: EssayForm) =>
      mutate(() => addEssayRequest(form, groups, companies)),
    reorderGroups: (ids: number[]) =>
      mutate(
        async () => saveEssayGroupOrder(await loadEssayGroups(), ids),
        true,
      ),
  };
}
