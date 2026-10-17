import { ArrowUpRight, FileText } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import type { DocumentListItem as DocumentItem } from '@/api/generated/models/documentListItem';
import { DeleteIconButton } from '@/shared/button';
import { DeleteDialog } from '@/shared/dialog';
import { DragHandle } from '@/shared/DragHandle';
import { cn } from '@/lib/utils';
import { useListDragSession } from '@/shared/useListDragSession';

type DocumentListProps = {
  documents: DocumentItem[];
  onDelete: (documentId: number) => Promise<boolean>;
  emptyMessage?: string;
  onReorder: (documents: DocumentItem[]) => void;
};

type DocumentListItemProps = {
  document: DocumentItem;
  onDelete: (documentId: number) => Promise<boolean>;
  onDragSessionStart: (cancelDrag: () => void) => void;
  onDragSessionEnd: () => void;
};

export function DocumentList({
  documents,
  onDelete,
  onReorder,
  emptyMessage,
}: DocumentListProps) {
  const { isDragSessionActive, startDragSession, endDragSession } =
    useListDragSession();
  const [draft, setDraft] = useState<DocumentItem[] | null>(null);
  const draftRef = useRef<DocumentItem[] | null>(null);
  const dragging = useRef(false);
  const visibleDocuments = draft ?? documents;

  function beginDrag(cancel: () => void) {
    dragging.current = true;
    draftRef.current = documents;
    startDragSession(() => {
      dragging.current = false;
      draftRef.current = null;
      setDraft(null);
      cancel();
    });
  }

  function drop() {
    const next = draftRef.current;
    if (
      dragging.current &&
      next &&
      next.some((item, index) => item.id !== documents[index]?.id)
    ) {
      onReorder(next);
    }
    dragging.current = false;
    draftRef.current = null;
    setDraft(null);
    endDragSession();
  }

  if (documents.length === 0) {
    return (
      <div className="ui-empty-state border border-dashed border-[var(--line-strong)] py-16 text-center">
        <FileText className="mx-auto size-7 text-[var(--faint)]" />
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">
          {emptyMessage ?? '該当するドキュメントはありません'}
        </p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={visibleDocuments}
      onReorder={(next) => {
        if (!dragging.current) return;
        draftRef.current = next;
        setDraft(next);
      }}
      data-drag-session={isDragSessionActive}
      className="space-y-2 p-0"
    >
      {visibleDocuments.map((document) => (
        <DocumentListItem
          key={document.id}
          document={document}
          onDelete={onDelete}
          onDragSessionStart={beginDrag}
          onDragSessionEnd={drop}
        />
      ))}
    </Reorder.Group>
  );
}

function DocumentListItem({
  document,
  onDelete,
  onDragSessionStart,
  onDragSessionEnd,
}: DocumentListItemProps) {
  const dragControls = useDragControls();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleting = useRef(false);

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
        onDragStart={() => onDragSessionStart(() => dragControls.cancel())}
        onDragEnd={onDragSessionEnd}
        layout="position"
        transition={{
          layout: {
            type: 'spring',
            stiffness: 420,
            damping: 34,
            mass: 0.75,
          },
        }}
        whileDrag={{
          x: 0,
          zIndex: 20,
          boxShadow: '0 16px 36px var(--shadow)',
        }}
        className={cn(
          'flex min-h-14 list-none items-stretch border border-[var(--line)] bg-[var(--panel)]',
          'ui-panel-interactive group hover:border-[var(--line-strong)]',
        )}
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

        <DragHandle
          onPointerDown={startDragging}
          label={`${document.title}を並べ替え`}
          title="ドラッグして並べ替え"
        />
      </Reorder.Item>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ドキュメントを削除しますか？"
          text={`「${document.title}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={async () => {
            if (deleting.current) return;
            deleting.current = true;
            try {
              if (await onDelete(document.id)) setIsDeleteDialogOpen(false);
            } finally {
              deleting.current = false;
            }
          }}
        />
      )}
    </>
  );
}
