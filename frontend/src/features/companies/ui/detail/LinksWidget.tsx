import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { companyProfile } from "@/features/companies/model/companyDetail";
import { RecordDialog } from "@/features/companies/ui/detail/RecordDialog";
import { WidgetFrame } from "@/features/companies/ui/detail/WidgetFrame";
import { TransParentAddButton } from "@/shared/button";

type LinksWidgetProps = {
  onRemove: () => void;
};

export function LinksWidget({ onRemove }: LinksWidgetProps) {
  const [links, setLinks] = useState(companyProfile.links);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addButton = (
    <TransParentAddButton
      text="レコードを追加"
      onClick={() => setIsDialogOpen(true)}
    />
  );

  return (
    <>
      <WidgetFrame
        title="関連リンク集"
        code="RELATED_LINKS"
        onRemove={onRemove}
        action={addButton}
      >
        <div className="divide-y divide-[var(--line)]">
          {links.map(([label, url]) => (
            <a
              key={`${label}-${url}`}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="grid gap-2 py-3 text-xs sm:grid-cols-[130px_1fr_auto]"
            >
              <span className="font-semibold text-[var(--text-strong)]">
                {label}
              </span>
              <span className="truncate font-mono text-[10px] text-[var(--muted)]">
                {url}
              </span>
              <ExternalLink className="size-3.5 text-[var(--accent)]" />
            </a>
          ))}
        </div>
      </WidgetFrame>

      {isDialogOpen && (
        <RecordDialog
          title="関連リンクを追加"
          labelName="リンク名"
          valueName="URL"
          valueType="url"
          onClose={() => setIsDialogOpen(false)}
          onSave={(label, value) => setLinks((current) => [
            ...current,
            [label, value],
          ])}
        />
      )}
    </>
  );
}
