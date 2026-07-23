import { ChevronDown, FileText, MoveRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import type { CompanyDocument } from "@/features/companies/model/companyDetail";
import { RichTextEditor } from "@/features/companies/ui/documents/RichTextEditor";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";

type DocumentsWidgetProps = {
  documents: CompanyDocument[];
};

export function DocumentsWidget({ documents }: DocumentsWidgetProps) {
  const { companyId } = useParams();

  const detailLink = (
    <Link
      to={`/companies/${companyId}/documents`}
      className="
        cyber-cut-sm flex h-8 items-center gap-1.5
        border border-[var(--accent)] bg-[var(--accent-soft)]
        px-3 text-[10px] font-bold text-[var(--accent)]
        transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]
      "
    >
      詳細画面
      <MoveRight className="size-3" />
    </Link>
  );

  return (
    <WidgetFrame
      title="ドキュメント"
      code="DOCUMENTS"
      action={detailLink}
      className="lg:col-span-2"
    >
      <div className="space-y-2">
        {documents.map((document) => (
          <details
            key={document.id}
            className="group border border-[var(--line)] bg-[var(--panel-raised)]"
          >
            <summary className="flex list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <FileText className="size-4 shrink-0 text-[var(--accent)]" />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--text-strong)]">
                {document.title}
              </span>
              <ChevronDown className="size-3.5 text-[var(--faint)] transition-transform group-open:rotate-180" />
            </summary>

            <div className="border-t border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6">
              <RichTextEditor
                value={document.content}
                onChange={() => undefined}
                readOnly
                minHeight={0}
                className="border-0 bg-transparent"
              />
            </div>
          </details>
        ))}
      </div>
    </WidgetFrame>
  );
}
