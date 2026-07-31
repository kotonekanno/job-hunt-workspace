import {
  ChevronDown,
  FileText,
  GripVertical,
} from "lucide-react";
import {
  Reorder,
  useDragControls,
} from "motion/react";
import {
  useState,
} from "react";
import type { CompanyDocument } from "@/features/companies/model/companyDetail";
import { DocumentCreateDialog } from "@/features/companies/ui/detail/DocumentCreateDialog";
import { RichTextEditor } from "@/features/companies/ui/documents/RichTextEditor";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import {
  AddButton,
  DeleteIconButton,
} from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import { SearchBox } from "@/shared/SearchBox";

type DocumentsWidgetProps = {
  documents: CompanyDocument[];
  onDocumentChange: (document: CompanyDocument) => void;
  onDocumentCreate: (title: string) => void;
  onDocumentDelete: (id: number) => void;
  onDocumentReorder: (orderedIds: number[]) => void;
};

type DocumentAccordionProps = {
  document: CompanyDocument;
  searchQuery: string;
  onChange: (document: CompanyDocument) => void;
  onDelete: (id: number) => void;
};

function DocumentAccordion({
  document,
  searchQuery,
  onChange,
  onDelete,
}: DocumentAccordionProps) {
  const dragControls = useDragControls();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const contentMatches = Boolean(
    searchQuery.trim()
    && document.text
      .toLocaleLowerCase()
      .includes(searchQuery.trim().toLocaleLowerCase()),
  );

  const isExpanded = isOpen || contentMatches;

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
        className="list-none"
      >
        <details
          open={isExpanded}
          onToggle={(event) => setIsOpen(event.currentTarget.open)}
          className="
            group border border-[var(--line)]
            bg-[var(--panel-raised)]
            transition-[border-color,box-shadow] duration-200
            open:border-[var(--line-strong)]
            hover:border-[var(--accent)]
            hover:shadow-[0_6px_16px_var(--shadow)]
          "
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                dragControls.start(event);
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              aria-label={`${document.title}を並べ替え`}
              title="ドラッグして並べ替え"
              className="flex size-8 shrink-0 touch-none cursor-grab items-center justify-center text-[var(--faint)] transition-colors hover:text-[var(--accent)] active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </button>

            <span className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text-strong)]">
              {document.title}
            </span>

            <DeleteIconButton
              size="s"
              transparent={false}
              ariaLabel={`${document.title}を削除`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            />

            <ChevronDown className="size-4 shrink-0 text-[var(--faint)] transition-transform group-open:rotate-180" />
          </summary>

          {isOpen && (
            <div className="border-t border-[var(--line)] bg-[var(--panel)]">
              <RichTextEditor
                value={document.text}
                onChange={(text) => onChange({
                  ...document,
                  text,
                })}
                minHeight={280}
                className="documents-accordion-editor"
                searchQuery={contentMatches ? searchQuery : ""}
              />
            </div>
          )}
        </details>
      </Reorder.Item>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="書類を削除しますか？"
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

export function DocumentsWidget({
  documents,
  onDocumentChange,
  onDocumentCreate,
  onDocumentDelete,
  onDocumentReorder,
}: DocumentsWidgetProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const orderedDocuments = [...documents].sort(
    (left, right) => left.position - right.position,
  );
  const filteredDocuments = orderedDocuments.filter((document) =>
    `${document.title}\n${document.text}`
      .toLocaleLowerCase()
      .includes(normalizedQuery));

  function reorderFilteredDocuments(
    orderedDocuments: CompanyDocument[],
  ) {
    const visibleIds = new Set(
      filteredDocuments.map((document) => document.id),
    );
    let visibleIndex = 0;

    const orderedIds = orderedDocuments.map((document) => {
      if (!visibleIds.has(document.id)) {
        return document.id;
      }

      const nextDocument = orderedDocuments[visibleIndex];
      visibleIndex += 1;

      return nextDocument.id;
    });

    onDocumentReorder(orderedIds);
  }

  return (
    <>
      <WidgetFrame
        title="ドキュメント"
        code="DOCUMENTS"
        icon={FileText}
        action={(
          <div className="flex items-center gap-2">
            <SearchBox
              value={query}
              onValueChange={setQuery}
              placeholder="タイトル・本文を検索"
              aria-label="ドキュメントを検索"
              size="s"
              className="w-44 sm:w-60"
            />

            <AddButton
              text="書類を追加"
              size="s"
              onClick={() => setIsCreateDialogOpen(true)}
            />
          </div>
        )}
        className="lg:col-span-2"
      >
        <Reorder.Group
          axis="y"
          values={filteredDocuments}
          onReorder={reorderFilteredDocuments}
          className="space-y-2 p-0"
        >
          {filteredDocuments.map((document) => (
            <DocumentAccordion
              key={document.id}
              document={document}
              searchQuery={query}
              onChange={onDocumentChange}
              onDelete={onDocumentDelete}
            />
          ))}
        </Reorder.Group>

        {filteredDocuments.length === 0 && (
          <p className="ui-empty-state border border-dashed border-[var(--line)] py-8 text-center text-xs text-[var(--faint)]">
            該当するドキュメントはありません
          </p>
        )}
      </WidgetFrame>

      {isCreateDialogOpen && (
        <DocumentCreateDialog
          onClose={() => setIsCreateDialogOpen(false)}
          onCreate={onDocumentCreate}
        />
      )}
    </>
  );
}
