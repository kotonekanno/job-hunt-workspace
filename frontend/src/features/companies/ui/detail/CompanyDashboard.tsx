import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCompanyDetail } from '@/features/companies/hooks/useCompanyDetail';
import { useCompanySelections } from '@/features/companies/hooks/useCompanySelections';
import {
  selectionStatusForApi,
  selectionStatusForDisplay,
} from '@/features/companies/lib/selectionStatusPresentation';
import {
  type WidgetType,
  widgetLabels,
  widgetOrder,
} from '@/features/companies/model/companyDetail';
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
  return (
    <CompanyDashboardContent key={companyId} companyId={Number(companyId)} />
  );
}
function CompanyDashboardContent({ companyId }: { companyId: number }) {
  const company = useCompanyDetail(companyId);
  const selections = useCompanySelections(companyId, company.setData);
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<WidgetType | null>(null);
  const [actionError, setActionError] = useState('');
  const data = company.data;
  const active = data?.selections?.find(
    (track) => track.id === data.activeSelectionId,
  );
  const current = active?.steps.find(
    (step) => step.id === active.currentStepId,
  );
  const hiddenWidgets = widgetOrder.filter(
    (widget) => !company.widgets.includes(widget),
  );
  async function run(operation: () => Promise<void>) {
    setActionError('');
    try {
      await operation();
    } catch {
      setActionError('処理に失敗しました。もう一度お試しください。');
    }
  }
  if (!data)
    return (
      <div className="mx-auto w-full max-w-7xl">
        <BackLink to="/companies">企業一覧へ戻る</BackLink>
        {company.isLoading ? (
          <p role="status" className="mt-4 text-sm text-[var(--muted)]">
            企業情報を読み込み中…
          </p>
        ) : (
          <p role="alert" className="mt-4 text-sm text-rose-500">
            {company.error}
          </p>
        )}
      </div>
    );

  function renderWidget(widget: WidgetType) {
    if (!data) return null;
    const requestRemoval = () => setPendingRemoval(widget);
    switch (widget) {
      case 'basic-info':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-2 [&>section]:h-full"
          >
            <BasicInfoWidget
              records={data.basicInfos ?? []}
              onCreate={company.createBasicInfo}
              onUpdate={company.updateBasicInfo}
              onDelete={company.removeBasicInfo}
              onRemove={requestRemoval}
            />
          </div>
        );
      case 'selection':
        return (
          <div
            key={widget}
            className="min-w-0 lg:col-start-1 lg:row-start-3 [&>section]:h-full"
          >
            <SelectionWidget
              tracks={data.selections ?? []}
              activeSelectionId={data.activeSelectionId}
              actions={selections}
              onRemove={requestRemoval}
            />
          </div>
        );
      case 'documents':
        return (
          <DocumentsWidget
            key={widget}
            document={data.document}
            onDocumentChange={company.saveDocument}
          />
        );
      case 'activities':
        return (
          <ActivitiesWidget
            key={widget}
            activities={data.activities}
            onSend={company.sendActivity}
            onUpdate={company.updateActivity}
            onDelete={company.removeActivity}
            onLoadOlder={company.loadOlderActivities}
            hasMore={company.hasMoreActivities}
            isLoadingOlder={company.isLoadingActivities}
          />
        );
      case 'events':
        return (
          <RelatedEventsWidget
            key={widget}
            events={data.events}
            companyName={data.name}
          />
        );
      case 'tasks':
        return (
          <RelatedTasksWidget
            key={widget}
            tasks={data.tasks}
            companyName={data.name}
          />
        );
    }
  }
  return (
    <div className="mx-auto w-full max-w-7xl">
      <CompanyHeader
        name={data.name}
        priority={company.priority}
        onNameChange={company.rename}
        onPriorityChange={company.changePriority}
        selection={
          company.priority !== 7 && active && current
            ? {
                title: active.title,
                step: current.name,
                status: selectionStatusForDisplay[current.status],
              }
            : undefined
        }
        onResultChange={(result) => {
          if (active && current)
            void run(() =>
              selections.updateStatus(
                active.id,
                current.id,
                selectionStatusForApi[result],
              ),
            );
        }}
      />
      {(company.error || actionError) && (
        <p role="alert" className="mt-4 text-sm text-rose-500">
          {company.error || actionError}
        </p>
      )}
      <div className="mt-4">
        <BackLink to="/companies">企業一覧へ戻る</BackLink>
      </div>
      <WidgetPicker
        hiddenWidgets={hiddenWidgets}
        onAdd={(widget) => {
          void run(() => company.setWidget(widget, true));
        }}
      />
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {company.widgets.map(renderWidget)}
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
          onConfirm={() => {
            if (isDeleting) return;
            setIsDeleting(true);
            void run(async () => {
              try {
                await company.removeCompany();
                navigate('/companies');
              } finally {
                setIsDeleting(false);
              }
            });
          }}
        />
      )}
      {pendingRemoval && (
        <DeleteDialog
          title="ウィジェットを削除しますか？"
          text={`「${widgetLabels[pendingRemoval]}」を非表示にします。`}
          onClose={() => setPendingRemoval(null)}
          onConfirm={() => {
            void run(async () => {
              await company.setWidget(pendingRemoval, false);
              setPendingRemoval(null);
            });
          }}
        />
      )}
    </div>
  );
}
