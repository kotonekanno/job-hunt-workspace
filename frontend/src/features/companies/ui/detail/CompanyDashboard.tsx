import { PageLoading } from '@/shared/LoadingState';
import { temporaryId } from '@/shared/useOptimisticState';
import type { CompanyListItem } from '@/api/generated/models/companyListItem';
import { loadCompanies } from '@/features/companies/lib/companyListApi';
import { toast } from '@/shared/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useSelectionProgress } from '@/features/companies/hooks/useSelectionProgress';
import { useCompanyDetail } from '@/features/companies/hooks/useCompanyDetail';
import { useCompanyDocument } from '@/features/companies/hooks/useCompanyDocument';
import {
  type WidgetType,
  widgetLabels,
  widgetOrder,
} from '@/features/companies/model/companyDetail';
import type { GetCompanyResponse } from '@/api/generated/models/getCompanyResponse';
import {
  removeBasicInfo,
  removeCompany,
  renameCompany,
  saveBasicInfo,
  saveCompanyPriority,
  saveCompanyWidgets,
} from '@/features/companies/lib/companyDetailApi';
import { SelectionProgressDialog } from '@/features/companies/ui/detail/SelectionProgressDialog';
import { BasicInfoWidget } from '@/features/companies/ui/detail/BasicInfoWidget';
import { CompanyHeader } from '@/features/companies/ui/detail/CompanyHeader';
import { DocumentsWidget } from '@/features/companies/ui/detail/DocumentsWidget';
import { ActivitiesWidget } from '@/features/companies/ui/detail/ActivitiesWidget';
import { RelatedEventsWidget } from '@/features/companies/ui/detail/RelatedEventsWidget';
import { RelatedTasksWidget } from '@/features/companies/ui/detail/RelatedTasksWidget';
import { SelectionWidget } from '@/features/companies/ui/detail/SelectionWidget';
import { WidgetPicker } from '@/features/companies/ui/detail/WidgetPicker';
import { BackLink } from '@/shared/BackLink';
import { DeleteDialog } from '@/shared/dialog';

export function CompanyDashboard() {
  const { companyId } = useParams();
  return <CompanyDetail key={companyId} id={Number(companyId)} />;
}
function CompanyDetail({ id }: { id: number }) {
  const company = useCompanyDetail(id);
  if (!company.detail && company.message === null) return <PageLoading />;
  if (!company.detail)
    return (
      <div className="mx-auto w-full max-w-7xl">
        <BackLink to="/companies">企業一覧へ戻る</BackLink>
        <p className="mt-5 text-sm text-[var(--muted)]">{company.message}</p>
      </div>
    );
  return <LoadedCompany id={id} company={company} detail={company.detail} />;
}
function LoadedCompany({
  id,
  company,
  detail,
}: {
  id: number;
  company: ReturnType<typeof useCompanyDetail>;
  detail: GetCompanyResponse;
}) {
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const selection = useSelectionProgress(id, detail, company.mutate);
  const document = useCompanyDocument(id, detail.document);
  const active = selection.tracks.find((track) => track.isActive);
  const current = active?.steps.find((step) => step.id === active.currentStep);
  const [pendingRemoval, setPendingRemoval] = useState<WidgetType | null>(null);
  const widgets = widgetOrder.filter((widget) =>
    widget === 'basic-info'
      ? detail.showBasicInfoWidget
      : widget === 'selection'
        ? detail.showSelectionWidget
        : true,
  );
  const hiddenWidgets = widgetOrder.filter(
    (widget) => !widgets.includes(widget),
  );
  const priority = detail.priority ?? 6;
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const choicesReady = useRef(false);
  const choicesRequest = useRef<Promise<boolean> | null>(null);
  function prepareCompanies(): Promise<boolean> {
    if (choicesReady.current) return Promise.resolve(true);
    if (choicesRequest.current) return choicesRequest.current;
    choicesRequest.current = loadCompanies()
      .then((items) => {
        setCompanies(items);
        choicesReady.current = true;
        return true;
      })
      .catch(() => {
        toast.error(
          '企業の選択肢を取得できませんでした。もう一度お試しください。',
        );
        return false;
      })
      .finally(() => {
        choicesRequest.current = null;
      });
    return choicesRequest.current;
  }
  function setWidget(widget: WidgetType, visible: boolean) {
    return company.mutate(
      (current) => {
        if (!current) return current;
        return widget === 'basic-info'
          ? {
              ...current,
              showBasicInfoWidget: visible,
              basicInfos: visible ? current.basicInfos : [],
            }
          : {
              ...current,
              showSelectionWidget: visible,
              selections: visible ? current.selections : [],
              activeSelectionId: visible ? current.activeSelectionId : null,
            };
      },
      () =>
        saveCompanyWidgets(
          id,
          widget === 'basic-info'
            ? { basicInfo: visible }
            : { selection: visible },
        ),
    );
  }
  function saveRecord(title: string, text: string, recordId?: number) {
    const localId = recordId ?? temporaryId();
    return company.mutate(
      (current) =>
        current
          ? {
              ...current,
              basicInfos:
                recordId === undefined
                  ? [
                      ...(current.basicInfos ?? []),
                      { id: localId, title, text },
                    ]
                  : current.basicInfos?.map((record) =>
                      record.id === localId
                        ? { ...record, title, text }
                        : record,
                    ),
            }
          : current,
      () => saveBasicInfo(id, { title, text }, recordId),
      (current, savedId) =>
        current
          ? {
              ...current,
              basicInfos: current.basicInfos?.map((record) =>
                record.id === localId ? { ...record, id: savedId } : record,
              ),
            }
          : current,
    );
  }
  function renderWidget(widget: WidgetType) {
    const requestRemoval = () => setPendingRemoval(widget);
    switch (widget) {
      case 'basic-info':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-2 [&>section]:h-full"
          >
            <BasicInfoWidget
              onRemove={requestRemoval}
              records={detail.basicInfos ?? []}
              onSave={saveRecord}
              onDelete={(recordId) =>
                company.mutate(
                  (current) =>
                    current
                      ? {
                          ...current,
                          basicInfos: current.basicInfos?.filter(
                            (record) => record.id !== recordId,
                          ),
                        }
                      : current,
                  () => removeBasicInfo(id, recordId),
                )
              }
            />
          </div>
        );
      case 'tasks':
        return (
          <RelatedTasksWidget
            key={widget}
            companyId={id}
            companyName={detail.name}
            initialTasks={detail.tasks}
            companies={companies}
            prepareCompanies={prepareCompanies}
          />
        );
      case 'events':
        return (
          <RelatedEventsWidget
            key={widget}
            companyId={id}
            companyName={detail.name}
            companies={companies}
            initialEvents={detail.events}
            prepareCompanies={prepareCompanies}
          />
        );
      case 'documents':
        return (
          <DocumentsWidget
            key={widget}
            document={document.text}
            onDocumentChange={document.update}
            onSave={document.save}
            dirty={document.dirty}
            saving={document.saving}
            disabled={document.blocked || deleting}
          />
        );
      case 'selection':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-3 [&>section]:h-full"
          >
            <SelectionWidget onRemove={requestRemoval} {...selection} />
          </div>
        );
      case 'activities':
        return (
          <ActivitiesWidget
            key={widget}
            companyId={id}
            initialActivities={detail.activities}
          />
        );
    }
  }
  return (
    <div className="mx-auto w-full max-w-7xl" hidden={deleting}>
      <CompanyHeader
        name={detail.name}
        priority={priority}
        onNameSave={async (name) => {
          const saved = await company.mutate(
            (current) => (current ? { ...current, name } : current),
            () => renameCompany(id, name),
          );
          if (saved)
            setCompanies((items) =>
              items.map((item) => (item.id === id ? { ...item, name } : item)),
            );
          return saved;
        }}
        onPriorityChange={(next) => {
          void company.mutate(
            (current) => (current ? { ...current, priority: next } : current),
            () => saveCompanyPriority(id, next),
          );
        }}
        selection={
          active && current
            ? {
                title: active.title,
                step: current.title,
                status: current.status,
              }
            : undefined
        }
        onResultChange={(result) => {
          if (active && current)
            selection.updateStepResult(active.id, current.id, result);
        }}
      />
      {selection.pendingChange && (
        <SelectionProgressDialog
          {...selection.pendingChange}
          onClose={selection.cancelChange}
          onConfirm={selection.confirmChange}
        />
      )}
      <div className="mt-4">
        <BackLink to="/companies">企業一覧へ戻る</BackLink>
      </div>
      <WidgetPicker
        hiddenWidgets={hiddenWidgets}
        onAdd={(widget) => {
          void setWidget(widget, true);
        }}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {widgets.map(renderWidget)}
      </div>
      <div className="mt-8 flex justify-center border-t border-[var(--line)] pt-5">
        <button
          type="button"
          onClick={() => setIsDeleteOpen(true)}
          className="flex cursor-pointer items-center gap-2 border border-rose-500/40 px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10"
        >
          <Trash2 className="size-4" />
          企業を削除
        </button>
      </div>
      {isDeleteOpen && (
        <DeleteDialog
          title="企業を削除しますか？"
          text="この企業と、企業に紐づくデータを削除します。この操作は取り消せません。"
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            if (deleting) return;
            setDeleting(true);
            if (
              (await document.save()) &&
              (await company.mutate(
                (current) => current,
                () => removeCompany(id),
              ))
            )
              navigate('/companies');
            else setDeleting(false);
          }}
        />
      )}
      {pendingRemoval && (
        <DeleteDialog
          title="ウィジェットを削除しますか？"
          text={`「${widgetLabels[pendingRemoval]}」と、ウィジェット内のデータをすべて削除します。この操作は取り消せません。`}
          onClose={() => setPendingRemoval(null)}
          onConfirm={async () => {
            if (await setWidget(pendingRemoval, false)) setPendingRemoval(null);
          }}
        />
      )}
    </div>
  );
}
