import type { JSONContent } from "@tiptap/core";
import { ArrowLeft, Check, FileText, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { initialDocuments } from "@/features/companies/model/companyDetail";
import { RichTextEditor } from "@/features/companies/ui/documents/RichTextEditor";
import { CompanyHeader } from "@/features/companies/ui/detail/CompanyHeader";

export function CompanyDocuments() {
  const { companyId } = useParams();
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      <CompanyHeader />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/companies/${companyId}`}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <ArrowLeft className="size-4" />
          企業詳細へ戻る
        </Link>

        <button
          type="button"
          onClick={saveDocument}
          disabled={isSaved}
          className="
            cyber-cut-sm flex h-10 cursor-pointer items-center gap-2
            bg-[var(--accent)] px-5 text-xs font-bold
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
          {isSaved ? "保存済み" : "保存する"}
        </button>
      </div>

      <div className="grid min-h-[620px] overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-[0_8px_30px_var(--shadow)] lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[var(--line)] bg-[var(--panel-raised)] p-4 lg:border-r lg:border-b-0">
          <p className="mb-3 font-mono text-[9px] tracking-[0.2em] text-[var(--accent)]">
            // DOCUMENTS
          </p>

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

        <main className="min-w-0 p-4 sm:p-6">
          <div className="mb-4">
            <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--faint)]">
              EDITING
            </p>
            <h2 className="mt-1 text-lg font-bold text-[var(--text-strong)]">
              {selectedDocument.title}
            </h2>
          </div>

          <RichTextEditor
            key={selectedDocument.id}
            value={selectedDocument.content}
            onChange={updateContent}
            placeholder="企業研究や面接対策を入力してください"
            minHeight={500}
          />
        </main>
      </div>
    </div>
  );
}
