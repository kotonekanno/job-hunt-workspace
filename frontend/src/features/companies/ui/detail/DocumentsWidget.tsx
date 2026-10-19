import { FileText, Save } from 'lucide-react';
import { useId, useState } from 'react';
import { SimpleRichTextEditor } from '@/features/companies/ui/documents/SimpleRichTextEditor';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { SearchBox } from '@/shared/SearchBox';

type DocumentsWidgetProps = {
  document: string;
  dirty: boolean;
  saving: boolean;
  disabled: boolean;
  onSave: () => Promise<boolean>;
  onDocumentChange: (document: string) => void;
};

export function DocumentsWidget({
  document,
  onDocumentChange,
  dirty,
  saving,
  disabled,
  onSave,
}: DocumentsWidgetProps) {
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
            aria-label="ドキュメントを保存"
            title={saving ? '保存中…' : '保存する'}
            disabled={disabled || saving || !dirty}
            onClick={() => {
              void onSave();
            }}
            className="flex size-8 items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--accent)] transition-colors hover:border-[var(--accent)] disabled:cursor-default disabled:opacity-40"
          >
            <Save className="size-4" />
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
      <SimpleRichTextEditor
        value={document}
        disabled={disabled}
        onChange={onDocumentChange}
        placeholder="企業研究や面接対策を自由に入力してください"
        minHeight={400}
        className="workspace-document-editor company-document-editor"
        staticAppearance
        searchQuery={query}
      />
    </WidgetFrame>
  );
}
