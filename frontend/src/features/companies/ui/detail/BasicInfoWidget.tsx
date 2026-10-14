import { Building2 } from 'lucide-react';
import { useState } from 'react';
import type {
  BasicInfo,
  CreateCompanyBasicInfoRequest,
  UpdateCompanyBasicInfoRequest,
} from '@/api/generated/models';
import { InlineRecordRow } from '@/features/companies/ui/detail/InlineRecordRow';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { OutlineAddButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { WidgetEmptyState } from '@/shared/WidgetEmptyState';

export function BasicInfoWidget({
  records,
  onCreate,
  onUpdate,
  onDelete,
  onRemove,
}: {
  records: BasicInfo[];
  onCreate: (request: CreateCompanyBasicInfoRequest) => Promise<void>;
  onUpdate: (id: number, patch: UpdateCompanyBasicInfoRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRemove: () => void;
}) {
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<BasicInfo>();
  const [error, setError] = useState('');
  async function save(record: BasicInfo, title: string, text: string) {
    const patch: UpdateCompanyBasicInfoRequest = {};
    if (title !== record.title) patch.title = title;
    if (text !== record.text) patch.text = text;
    await onUpdate(record.id, patch);
  }
  return (
    <>
      <WidgetFrame
        title="基本情報"
        code="BASIC_INFO"
        icon={Building2}
        onRemove={onRemove}
        action={
          <OutlineAddButton
            text="レコードを追加"
            onClick={() =>
              setDraftIds((current) => [...current, crypto.randomUUID()])
            }
          />
        }
      >
        {error && (
          <p role="alert" className="text-sm text-rose-500">
            {error}
          </p>
        )}
        {!records.length && !draftIds.length ? (
          <WidgetEmptyState text="基本情報のレコードを追加しましょう" />
        ) : (
          <table
            aria-label="基本情報"
            className="w-full table-fixed border-collapse"
          >
            <colgroup>
              <col className="w-[30%]" />
              <col />
              <col className="w-[72px]" />
            </colgroup>
            <tbody>
              {records.map((record) => (
                <InlineRecordRow
                  key={record.id}
                  label={record.title}
                  value={record.text}
                  labelName="項目名"
                  valueName="内容"
                  allowEmptyValue
                  labelMaxLength={50}
                  valueMaxLength={500}
                  onSave={(title, text) => save(record, title, text)}
                  onCancelNew={() => {}}
                  onDelete={() => setDeleting(record)}
                />
              ))}
              {draftIds.map((id) => (
                <InlineRecordRow
                  key={id}
                  label=""
                  value=""
                  isNew
                  allowEmptyValue
                  labelMaxLength={50}
                  valueMaxLength={500}
                  labelName="項目名"
                  valueName="内容"
                  onSave={async (title, text) => {
                    await onCreate({ title, text });
                    setDraftIds((current) =>
                      current.filter((item) => item !== id),
                    );
                  }}
                  onCancelNew={() =>
                    setDraftIds((current) =>
                      current.filter((item) => item !== id),
                    )
                  }
                  onDelete={() => {}}
                />
              ))}
            </tbody>
          </table>
        )}
      </WidgetFrame>
      {deleting && (
        <DeleteDialog
          title="レコードを削除しますか？"
          text={`「${deleting.title}」を削除します。`}
          onClose={() => setDeleting(undefined)}
          onConfirm={async () => {
            try {
              await onDelete(deleting.id);
              setDeleting(undefined);
            } catch {
              setError('基本情報を削除できませんでした。');
            }
          }}
        />
      )}
    </>
  );
}
