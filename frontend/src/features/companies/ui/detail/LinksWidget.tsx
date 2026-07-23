import { Link2 } from "lucide-react";
import { companyProfile } from "@/features/companies/model/companyDetail";
import { RecordTableWidget } from "@/features/companies/ui/detail/RecordTableWidget";

type LinksWidgetProps = {
  onRemove: () => void;
};

export function LinksWidget({
  onRemove,
}: LinksWidgetProps) {
  return (
    <RecordTableWidget
      title="関連リンク集"
      code="RELATED_LINKS"
      icon={Link2}
      initialRecords={companyProfile.links}
      dialogTitle="関連リンクを追加"
      labelName="リンク名"
      valueName="URL"
      valueType="url"
      onRemove={onRemove}
      renderValue={(url) => (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-block max-w-full cursor-pointer truncate align-bottom font-mono text-sm text-[var(--accent)] hover:underline"
        >
          {url}
        </a>
      )}
    />
  );
}
