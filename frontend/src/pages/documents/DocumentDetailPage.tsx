import { FileText } from "lucide-react";
import { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { RichTextEditor } from "@/features/companies/ui/documents/RichTextEditor";
import { useDocumentArchive } from "@/features/documents/hooks/useDocumentArchive";
import { BackLink } from "@/shared/BackLink";
import { DeleteIconButton } from "@/shared/button";
import { DeleteDialog } from "@/shared/dialog";
import { SearchBox } from "@/shared/SearchBox";

export function DocumentDetailPage() {
  const navigate = useNavigate();
  const { documentsId } = useParams();
  const documentArchive = useDocumentArchive();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const document = documentArchive.documents.find(
    (candidate) => candidate.id === Number(documentsId),
  );

  if (!document) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
        <div className="mt-5 border border-dashed border-[var(--line-strong)] bg-[var(--panel)] py-16 text-center">
          <p className="text-sm font-bold text-[var(--muted)]">
            指定されたドキュメントは見つかりませんでした
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4">
        <BackLink to="/documents">ドキュメント一覧へ戻る</BackLink>
      </div>

      <header className="flex items-center gap-4 border border-[var(--line)] bg-[var(--panel)] px-5 py-4 shadow-[0_4px_16px_var(--shadow)]">
        <div className="flex size-11 shrink-0 items-center justify-center border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--accent)]">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[var(--muted)]">
            DOCUMENT
          </p>
          <h1 className="mt-1 truncate text-xl font-black text-[var(--text-strong)]">
            {document.title}
          </h1>
        </div>
        <DeleteIconButton
          size="m"
          transparent={false}
          ariaLabel={`${document.title}を削除`}
          onClick={() => setIsDeleteDialogOpen(true)}
        />
      </header>

      <div className="mt-4 border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_4px_16px_var(--shadow)]">
        <SearchBox
          value={query}
          onValueChange={setQuery}
          placeholder="本文を検索"
          aria-label="ドキュメント本文を検索"
        />
      </div>

      <div className="mt-4">
        <RichTextEditor
          value={document.content}
          onChange={(content) => documentArchive.updateDocument({
            ...document,
            content,
          })}
          placeholder="自由にメモを入力してください"
          minHeight={560}
          className="workspace-document-editor"
          staticAppearance
          searchQuery={query}
        />
      </div>

      {isDeleteDialogOpen && (
        <DeleteDialog
          title="ドキュメントを削除しますか？"
          text={`「${document.title}」を削除します。この操作は取り消せません。`}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            documentArchive.deleteDocument(document.id);
            navigate("/documents");
          }}
        />
      )}
    </div>
  );
}
