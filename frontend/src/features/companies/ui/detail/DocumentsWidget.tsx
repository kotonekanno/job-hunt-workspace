import { FileText } from 'lucide-react';
import { useId, useState } from 'react';
import type { DocumentText } from '@/api/generated/models';
import { SimpleRichTextEditor } from '@/features/companies/ui/documents/SimpleRichTextEditor';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { SearchBox } from '@/shared/SearchBox';

type DocumentsWidgetProps = {
  document: DocumentText;
  onDocumentChange: (document: DocumentText) => Promise<void>;
};

export function DocumentsWidget({
  document,
  onDocumentChange,
}: DocumentsWidgetProps) {
  const [draft, setDraft] = useState(document);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const editorId = useId();

  return (
    <WidgetFrame
      title="ドキュメント"
      code="DOCUMENT"
      icon={FileText}
      className="lg:col-span-2"
      expanded={isExpanded}
      onToggle={() => setIsExpanded((current) => !current)}
      contentId={editorId}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving || draft === document}
            className="cursor-pointer border border-[var(--accent)] px-3 py-1.5 text-xs text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={async () => {
              setIsSaving(true);
              setError('');
              try {
                await onDocumentChange(draft);
              } catch {
                setError('文書を保存できませんでした。');
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? '保存中…' : '保存する'}
          </button>
          <SearchBox
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              if (value.length > 0) setIsExpanded(true);
            }}
            placeholder="本文を検索"
            aria-label="企業ドキュメント本文を検索"
            size="s"
            className="w-44 sm:w-60"
          />
        </div>
      }
    >
      {error && (
        <p role="alert" className="text-sm text-rose-500">
          {error}
        </p>
      )}
      <SimpleRichTextEditor
        value={draft}
        onChange={setDraft}
        placeholder="企業研究や面接対策を自由に入力してください"
        minHeight={400}
        className="workspace-document-editor company-document-editor"
        staticAppearance
        searchQuery={query}
      />
    </WidgetFrame>
  );
}
