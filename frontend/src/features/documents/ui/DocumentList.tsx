import {
  ArrowUpRight,
  FileText,
  GripVertical,
} from "lucide-react";
import {
  Reorder,
  useDragControls,
} from "motion/react";
import {
  useState,
  type PointerEvent,
} from "react";
import { Link } from "react-router-dom";
import type { WorkspaceDocument } from "@/features/documents/model/document";
import { DeleteIconButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";

type DocumentListProps = {
  documents: WorkspaceDocument[];
  onDelete: (documentId: number) => void;
  onReorder: (documents: WorkspaceDocument[]) => void;
};

type DocumentListItemProps = {
  document: WorkspaceDocument;
  onDelete: (documentId: number) => void;
};

export function DocumentList({
  documents,
  onDelete,
  onReorder,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="ui-empty-state border border-dashed border-[var(--line-strong)] py-16 text-center">
        <FileText className="mx-auto size-7 text-[var(--faint)]" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">
          該当するドキュメントはありません
        </p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={documents}
      onReorder={onReorder}
      className="space-y-2 p-0"
    >
      {documents.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          onDelete={onDelete}
        />
      ))}
    </Reorder.Group>
  );
}

function DocumentListItem({
  document,
  onDelete,
}: DocumentListItemProps) {
  const dragControls = useDragControls();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  function startDragging(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragControls.start(event);
  }

  return (
    <>
      <Reorder.Item
        value={document}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        transition={{
          layout: {
            type: "spring",
            stiffness: 420,
            damping: 34,
            mass: 0.75,
          },
        }}
        whileDrag={{
          x: 0,
          zIndex: 20,
          boxShadow: "0 16px 36px var(--shadow)",
        }}
        className="ui-panel-interactive group flex min-h-14 list-none items-stretch border border-[var(--line)] bg-[var(--panel)]"
      >
        <Link
          to={`/documents/${document.id}`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-3"
        >
          <ArrowUpRight className="size-4 shrink-0 text-[var(--accent)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <FileText className="size-4 shrink-0 text-[var(--muted)]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-[var(--text-strong)]">
              {document.title}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center px-3">
          <DeleteIconButton
            size="s"
            transparent={false}
            ariaLabel={`${document.title}を削除`}
            onClick={() => setIsDeleteDialogOpen(true)}
          />
        </div>

        <button
          type="button"
          onPointerDown={startDragging}
          aria-label={`${document.title}を並べ替え`}
          title="ドラッグして並べ替え"
          className="flex w-11 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--faint)] transition-colors hover:bg-[var(--panel-raised)] hover:text-[var(--accent)] active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      </Reorder.Item>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ドキュメントを削除しますか？"
          text={`「${document.title}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            onDelete(document.id);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
