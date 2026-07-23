import type { JSONContent } from "@tiptap/core";
import { ArrowLeft, Check, FileText, Save } from "lucide-react";
import {
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { initialDocuments } from "@/features/companies/model/companyDetail";
import { RichTextEditor } from "@/features/companies/ui/documents/RichTextEditor";
import { CompanyHeader } from "@/features/companies/ui/detail/CompanyHeader";
import { Tooltip } from "@/shared/tooltip";

export function CompanyDocuments() {
  const { companyId } = useParams();
  const editingHeaderRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState(initialDocuments);
  const requestedId = Number(searchParams.get("document"));
  const [selectedId, setSelectedId] = useState(
    Number.isFinite(requestedId) && requestedId > 0
      ? requestedId
      : initialDocuments[0].id,
  );
  const [isSaved, setIsSaved] = useState(true);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? documents[0],
    [documents, selectedId],
  );

  function updateContent(content: JSONContent) {
    setIsSaved(false);
    setDocuments((current) => current.map((document) =>
      document.id === selectedId
        ? { ...document, content }
        : document));
  }

  function selectDocument(id: number) {
    setSelectedId(id);
    setSearchParams({ document: String(id) });
    setIsSaved(true);
  }

  function saveDocument() {
    setDocuments((current) => current.map((document) =>
      document.id === selectedId
        ? { ...document, updatedAt: "2026-07-23" }
        : document));
    setIsSaved(true);
  }

  function scrollPageBeforeEditor(event: WheelEvent<HTMLDivElement>) {
    if (event.deltaY <= 0) {
      return;
    }

    const editingHeader = editingHeaderRef.current;

    if (!editingHeader) {
      return;
    }

    const fixedHeaderHeight = 64;
    const distanceToViewportTop =
      editingHeader.getBoundingClientRect().top - fixedHeaderHeight;

    if (distanceToViewportTop <= 0) {
      return;
    }

    event.preventDefault();
    window.scrollBy({
      top: Math.min(event.deltaY, distanceToViewportTop),
      behavior: "auto",
    });
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <CompanyHeader />

      <div className="mb-4 flex items-center">
        <Link
          to={`/companies/${companyId}`}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <ArrowLeft className="size-4" />
          企業詳細へ戻る
        </Link>
      </div>

      <div
        className="
          grid overflow-hidden
          border border-[var(--line)] bg-[var(--panel)]
          shadow-[0_8px_30px_var(--shadow)]
          lg:h-[calc(100dvh-8.5rem)]
          lg:grid-cols-[260px_1fr] lg:grid-rows-1
        "
      >
        <aside className="border-b border-[var(--line)] bg-[var(--panel-raised)] p-4 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
          <div className="space-y-1">
            {documents.map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => selectDocument(document.id)}
                className={`flex w-full items-center gap-2 border-l-2 px-3 py-3 text-left ${selectedId === document.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-transparent"}`}
              >
                <FileText className="size-4 shrink-0 text-[var(--accent)]" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[var(--text-strong)]">
                    {document.title}
                  </span>
                  <span className="mt-1 block font-mono text-[9px] text-[var(--faint)]">
                    {document.updatedAt}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main
          className="
            flex h-[calc(100dvh-7.5rem)] min-h-0 min-w-0 flex-col p-4
            sm:p-6 md:h-[calc(100dvh-8rem)] lg:h-auto
          "
        >
          <div
            ref={editingHeaderRef}
            className="mb-4 flex shrink-0 items-center gap-3"
          >
            <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-[var(--text-strong)]">
              {selectedDocument.title}
            </h2>

            <Tooltip
              content={isSaved ? "保存済み" : "文書を保存"}
              side="bottom"
            >
              <button
                type="button"
                onClick={saveDocument}
                disabled={isSaved}
                aria-label={isSaved ? "保存済み" : "文書を保存"}
                className="
                  flex size-9 shrink-0 cursor-pointer items-center
                  justify-center bg-[var(--accent)]
                  text-[var(--accent-contrast)] transition-colors
                  hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]
                  disabled:cursor-not-allowed disabled:bg-[var(--accent-soft)]
                  disabled:text-[var(--accent)]
                "
              >
                {isSaved ? (
                  <Check className="size-4" />
                ) : (
                  <Save className="size-4" />
                )}
              </button>
            </Tooltip>
          </div>

          <div
            className="min-h-0 flex-1"
            onWheel={scrollPageBeforeEditor}
          >
            <RichTextEditor
              key={selectedDocument.id}
              value={selectedDocument.content}
              onChange={updateContent}
              placeholder="企業研究や面接対策を入力してください"
              minHeight={0}
              className="company-documents-editor h-full"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
