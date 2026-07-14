import {
  Check,
  ChevronDown,
  FilePenLine,
  X,
} from "lucide-react";
import { useState, type MouseEvent } from "react";
import type { Essay } from "@/features/essay/model/essay";
import { CompanyBadge } from "@/shared/badge";
import {
  DeleteIconButton,
  EditIconButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

type EssayUpdates = Partial<Pick<Essay, "question" | "answer">>;

type EssayListProps = {
  essays: Essay[];
  onUpdate: (essayId: number, updates: EssayUpdates) => void;
  onDelete: (essayId: number) => void;
};

type EssayListItemProps = {
  essay: Essay;
  onUpdate: (essayId: number, updates: EssayUpdates) => void;
  onDelete: (essayId: number) => void;
};

type EditingField = "question" | "answer" | null;

export function EssayList({
  essays,
  onUpdate,
  onDelete,
}: EssayListProps) {
  if (essays.length === 0) {
    return (
      <div className="border border-dashed border-[var(--line-strong)] bg-[var(--panel)] py-16 text-center">
        <FilePenLine className="mx-auto size-7 text-[var(--faint)]" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">
          条件に一致する文章はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {essays.map((essay) => (
        <EssayListItem
          key={essay.id}
          essay={essay}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function EssayListItem({
  essay,
  onUpdate,
  onDelete,
}: EssayListItemProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draft, setDraft] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function startEditing(
    field: Exclude<EditingField, null>,
    clickEvent: MouseEvent<HTMLButtonElement>,
  ) {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    setEditingField(field);
    setDraft(essay[field]);
  }

  function saveEditing(clickEvent: MouseEvent<HTMLButtonElement>) {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();

    if (!editingField || !draft.trim()) return;

    onUpdate(essay.id, { [editingField]: draft.trim() });
    setEditingField(null);
  }

  function cancelEditing(clickEvent: MouseEvent<HTMLButtonElement>) {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    setEditingField(null);
    setDraft("");
  }

  return (
    <>
      <details className="group border border-[var(--line)] bg-[var(--panel)] shadow-[0_3px_12px_var(--shadow)] transition-[border-color,box-shadow] open:border-[var(--line-strong)] hover:border-[var(--accent)] hover:shadow-[0_5px_16px_var(--shadow)]">
        <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <CompanyBadge
              company={essay.company}
              className="inline-block max-w-full px-2"
            />

            <div className="mt-2 flex items-start gap-2">
              {editingField === "question" ? (
                <InlineEditor
                  value={draft}
                  rows={2}
                  ariaLabel="設問を編集"
                  onChange={setDraft}
                  onSave={saveEditing}
                  onCancel={cancelEditing}
                />
              ) : (
                <>
                  <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-[var(--text-strong)]">
                    {essay.question}
                  </p>
                  <EditIconButton
                    size="s"
                    transparent={false}
                    ariaLabel="設問を編集"
                    onClick={(event) => startEditing("question", event)}
                  />
                </>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {essay.traits.map((trait) => (
                <span
                  key={trait}
                  className="border border-[var(--line-strong)] bg-[var(--panel-raised)] px-2 py-0.5 text-[9px] font-semibold text-[var(--muted)]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          <DeleteIconButton
            size="s"
            transparent={false}
            ariaLabel="ESを削除"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          />

          <ChevronDown className="mt-1 size-4 shrink-0 text-[var(--faint)] transition-transform group-open:rotate-180" />
        </summary>

        <div className="border-t border-[var(--line)] px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[var(--accent)]">
              ANSWER
            </p>

            {editingField !== "answer" && (
              <EditIconButton
                size="s"
                transparent={false}
                ariaLabel="回答を編集"
                onClick={(event) => startEditing("answer", event)}
              />
            )}
          </div>

          {editingField === "answer" ? (
            <div className="mt-3">
              <InlineEditor
                value={draft}
                rows={8}
                ariaLabel="回答を編集"
                onChange={setDraft}
                onSave={saveEditing}
                onCancel={cancelEditing}
              />
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">
              {essay.answer}
            </p>
          )}

          <p className="mt-4 text-right font-mono text-[9px] text-[var(--faint)]">
            {(editingField === "answer" ? draft : essay.answer).length} 文字
          </p>
        </div>
      </details>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ESを削除しますか？"
          text={`「${essay.question}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            onDelete(essay.id);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}
    </>
  );
}

type InlineEditorProps = {
  value: string;
  rows: number;
  ariaLabel: string;
  onChange: (value: string) => void;
  onSave: (event: MouseEvent<HTMLButtonElement>) => void;
  onCancel: (event: MouseEvent<HTMLButtonElement>) => void;
};

function InlineEditor({
  value,
  rows,
  ariaLabel,
  onChange,
  onSave,
  onCancel,
}: InlineEditorProps) {
  return (
    <div
      className="min-w-0 flex-1"
      onClick={(event) => event.stopPropagation()}
    >
      <textarea
        autoFocus
        value={value}
        rows={rows}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y border border-[var(--accent)] bg-[var(--panel-raised)] p-3 text-sm leading-7 text-[var(--text)] outline-none shadow-[0_0_0_2px_var(--accent-soft)]"
      />

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 border border-[var(--line)] px-3 text-[10px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
        >
          <X className="size-3" />
          キャンセル
        </button>

        <button
          type="button"
          disabled={!value.trim()}
          onClick={onSave}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 border border-[var(--accent)] bg-[var(--accent)] px-3 text-[10px] font-bold text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="size-3" />
          保存
        </button>
      </div>
    </div>
  );
}
