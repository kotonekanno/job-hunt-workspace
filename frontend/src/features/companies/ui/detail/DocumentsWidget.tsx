import { FileText } from 'lucide-react';
import { useId, useState } from 'react';
import type { CompanyDocument } from '@/features/companies/model/companyDetail';
import { SimpleRichTextEditor } from '@/features/companies/ui/documents/SimpleRichTextEditor';
import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { SearchBox } from '@/shared/SearchBox';

type DocumentsWidgetProps = {
  document: CompanyDocument;
  onDocumentChange: (document: CompanyDocument) => void;
};

export function DocumentsWidget({
  document,
  onDocumentChange,
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
      }
    >
      <SimpleRichTextEditor
        value={document.text}
        onChange={(text) => onDocumentChange({ ...document, text })}
        placeholder="企業研究や面接対策を自由に入力してください"
        minHeight={400}
        className="workspace-document-editor company-document-editor"
        staticAppearance
        searchQuery={query}
      />
    </WidgetFrame>
  );
}
