import { ArrowLeft, FileText, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { initialDocuments } from "@/features/companies/model/companyDetail";
import { MarkdownPreview } from "@/features/companies/ui/documents/MarkdownPreview";

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
  const [isEditing, setIsEditing] = useState(false);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? documents[0],
    [documents, selectedId],
  );

  function updateContent(content: string) {
    setDocuments((current) => current.map((document) =>
      document.id === selectedId
        ? { ...document, content, updatedAt: "2026-07-12" }
        : document));
  }

  function selectDocument(id: number) {
    setSelectedId(id);
    setSearchParams({ document: String(id) });
    setIsEditing(false);
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
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
          onClick={() => setIsEditing((current) => !current)}
          className="cyber-cut-sm flex h-10 items-center gap-2 bg-[var(--accent)] px-5 text-xs font-bold text-[var(--accent-contrast)]"
        >
          <Save className="size-4" />
          {isEditing ? "プレビューを見る" : "Markdownを編集"}
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

        <main className="p-5 sm:p-8">
          {isEditing ? (
            <textarea
              value={selectedDocument.content}
              onChange={(event) => updateContent(event.target.value)}
              className="min-h-[540px] w-full resize-none bg-transparent font-mono text-sm leading-7 text-[var(--text)] outline-none"
              aria-label={`${selectedDocument.title}を編集`}
            />
          ) : (
            <MarkdownPreview content={selectedDocument.content} />
          )}
        </main>
      </div>
    </div>
  );
}
