import { authenticatedRequest } from '@/api/authenticatedRequest';
import { useEffect, useRef, useState } from 'react';
import * as api from '@/api/generated/api';
import type {
  GetCompanyResponse,
  CompanyPriority,
  CreateCompanyBasicInfoRequest,
  UpdateCompanyBasicInfoRequest,
  CreateCompanyActivityRequest,
  UpdateCompanyActivityRequest,
  UpdateCompanyWidgetRequest,
} from '@/api/generated/models';
import {
  widgetOrder,
  type WidgetType,
} from '@/features/companies/model/companyDetail';

export function useCompanyDetail(companyId: number) {
  const [data, setData] = useState<GetCompanyResponse>();
  const [priority, setPriority] = useState<CompanyPriority | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  const nextPage = useRef(1);
  const paging = useRef(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const generation = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentGeneration = ++generation.current;
    setData(undefined);
    setPriority(null);
    setError('');
    setIsLoading(true);
    nextPage.current = 1;
    paging.current = false;
    setIsLoadingActivities(false);
    async function load() {
      try {
        if (!Number.isSafeInteger(companyId) || companyId < 1)
          throw new Error('企業IDが不正です。');
        const response = await authenticatedRequest(
          (options) => api.getCompanyById(companyId, options),
          {
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        if (response.status !== 200)
          throw new Error('企業情報を取得できませんでした。');
        setData(response.data);
        setHasMoreActivities(response.data.activities.length >= 20);
        // 詳細レスポンスには志望度がないため、一覧から補完する。
        const list = await authenticatedRequest(
          (options) => api.getCompanies(options),
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (list.status !== 200)
          throw new Error('志望度を取得できませんでした。');
        setPriority(
          list.data.companies.find((company) => company.id === companyId)
            ?.priority ?? null,
        );
      } catch (cause) {
        if (
          !controller.signal.aborted &&
          generation.current === currentGeneration
        )
          setError(
            cause instanceof Error
              ? cause.message
              : '企業情報を取得できませんでした。',
          );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [companyId]);

  async function perform<T>(operation: () => Promise<T>): Promise<T> {
    setError('');
    try {
      return await operation();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : '更新できませんでした。',
      );
      throw cause;
    }
  }
  function requireSuccess(response: { status: number }) {
    if (response.status !== 204) throw new Error('更新できませんでした。');
  }
  async function rename(name: string) {
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.patchCompany(companyId, { name }, options),
        ),
      );
      setData((current) => current && { ...current, name });
    });
  }
  async function changePriority(next: CompanyPriority) {
    if (next === priority) return;
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.patchCompanyPriority(
            companyId,
            {
              priority: next,
              nextCompanyId: null,
            },
            options,
          ),
        ),
      );
      setPriority(next);
    });
  }
  async function setWidget(widget: WidgetType, visible: boolean) {
    const patch: UpdateCompanyWidgetRequest =
      widget === 'basic-info' ? { basicInfo: visible } : { selection: visible };
    if (widget !== 'basic-info' && widget !== 'selection') return;
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.patchCompanyWidgets(companyId, patch, options),
        ),
      );
      setData(
        (current) =>
          current && {
            ...current,
            ...(widget === 'basic-info'
              ? { showBasicInfoWidget: visible }
              : { showSelectionWidget: visible }),
          },
      );
    });
  }
  async function createBasicInfo(request: CreateCompanyBasicInfoRequest) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.createCompanyBasicInfo(companyId, request, options),
      );
      if (response.status !== 201)
        throw new Error('基本情報を追加できませんでした。');
      const record = { ...request, id: response.data.basicInfoId };
      setData(
        (current) =>
          current && {
            ...current,
            basicInfos: [...(current.basicInfos ?? []), record],
          },
      );
    });
  }
  async function updateBasicInfo(
    id: number,
    patch: UpdateCompanyBasicInfoRequest,
  ) {
    if (!Object.keys(patch).length) return;
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.patchCompanyBasicInfo(companyId, id, patch, options),
        ),
      );
      setData(
        (current) =>
          current && {
            ...current,
            basicInfos: current.basicInfos?.map((record) =>
              record.id === id ? { ...record, ...patch } : record,
            ),
          },
      );
    });
  }
  async function removeBasicInfo(id: number) {
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.deleteCompanyBasicInfo(companyId, id, options),
        ),
      );
      setData(
        (current) =>
          current && {
            ...current,
            basicInfos: current.basicInfos?.filter(
              (record) => record.id !== id,
            ),
          },
      );
    });
  }
  async function loadOlderActivities() {
    if (!hasMoreActivities || paging.current) return;
    paging.current = true;
    setIsLoadingActivities(true);
    const currentGeneration = generation.current;
    try {
      await perform(async () => {
        const response = await authenticatedRequest((options) =>
          api.getCompanyActivity(
            companyId,
            {
              page: nextPage.current,
            },
            options,
          ),
        );
        if (generation.current !== currentGeneration) return;
        if (response.status !== 201)
          throw new Error('過去のやりとりを取得できませんでした。');
        const older = response.data.activities ?? [];
        setData((current) => {
          if (!current) return current;
          const ids = new Set(
            current.activities.map((activity) => activity.id),
          );
          return {
            ...current,
            activities: [
              ...older.filter((activity) => !ids.has(activity.id)),
              ...current.activities,
            ],
          };
        });
        nextPage.current += 1;
        setHasMoreActivities(older.length >= 20);
      });
    } finally {
      if (generation.current === currentGeneration) {
        paging.current = false;
        setIsLoadingActivities(false);
      }
    }
  }
  async function sendActivity(request: CreateCompanyActivityRequest) {
    await perform(async () => {
      const response = await authenticatedRequest((options) =>
        api.createCompanyActivity(companyId, request, options),
      );
      if (response.status !== 201)
        throw new Error('メッセージを送信できませんでした。');
      const activity = {
        ...request,
        id: response.data.activityId,
        occurredAt: new Date().toISOString(),
      };
      setData(
        (current) =>
          current && {
            ...current,
            activities: [...current.activities, activity],
          },
      );
    });
  }
  async function updateActivity(
    id: number,
    patch: UpdateCompanyActivityRequest,
  ) {
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.patchCompanyActivity(companyId, id, patch, options),
        ),
      );
      setData(
        (current) =>
          current && {
            ...current,
            activities: current.activities.map((activity) =>
              activity.id === id ? { ...activity, ...patch } : activity,
            ),
          },
      );
    });
  }
  async function removeActivity(id: number) {
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.deleteCompanyActivity(companyId, id, options),
        ),
      );
      setData(
        (current) =>
          current && {
            ...current,
            activities: current.activities.filter(
              (activity) => activity.id !== id,
            ),
          },
      );
    });
  }
  async function saveDocument(document: string) {
    await perform(async () => {
      requireSuccess(
        await authenticatedRequest((options) =>
          api.putCompanyDocument(companyId, { document }, options),
        ),
      );
      setData((current) => current && { ...current, document });
    });
  }
  async function removeCompany() {
    await perform(async () =>
      requireSuccess(
        await authenticatedRequest((options) =>
          api.deleteCompanyById(companyId, options),
        ),
      ),
    );
  }
  const widgets = widgetOrder.filter(
    (widget) =>
      data &&
      (widget === 'basic-info'
        ? data.showBasicInfoWidget
        : widget === 'selection'
          ? data.showSelectionWidget
          : true),
  );
  return {
    data,
    setData,
    priority,
    error,
    isLoading,
    widgets,
    rename,
    changePriority,
    setWidget,
    createBasicInfo,
    updateBasicInfo,
    removeBasicInfo,
    hasMoreActivities,
    isLoadingActivities,
    loadOlderActivities,
    sendActivity,
    updateActivity,
    removeActivity,
    saveDocument,
    removeCompany,
    perform,
  };
}
