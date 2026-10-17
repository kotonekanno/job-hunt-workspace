import type { EssayGroupListItem } from '@/api/generated/models/essayGroupListItem';

export type EssayGroupOption = Pick<EssayGroupListItem, 'name'> & {
  id: string;
};
import { CompanyCombobox } from '@/shared/CompanyCombobox';

type EssayGroupComboboxProps = {
  value: string;
  groups: EssayGroupOption[];
  onValueChange: (groupId: string) => void;
  className?: string;
  clearSearchOnOpen?: boolean;
};

export function EssayGroupCombobox({
  value,
  groups,
  onValueChange,
  className = '',
  clearSearchOnOpen = false,
}: EssayGroupComboboxProps) {
  const selectedName = groups.find((group) => group.id === value)?.name ?? '';
  const groupNames = groups.map((group) => group.name);

  return (
    <CompanyCombobox
      clearSearchOnOpen={clearSearchOnOpen}
      value={selectedName}
      options={groupNames}
      required
      onValueChange={(name) => {
        const group = groups.find((candidate) => candidate.name === name);
        if (group) onValueChange(group.id);
      }}
      placeholder="質問の性質を検索"
      invalidMessage="登録済みの質問の性質から選択してください。"
      noResultsText="該当する質問の性質はありません"
      className={className}
    />
  );
}
