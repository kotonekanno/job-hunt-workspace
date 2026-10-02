import { Building2, Check, UserRound } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import type { ActivitySender } from '@/features/companies/model/activity';

const senders = [
  { value: 'user', label: 'ユーザー', icon: UserRound },
  { value: 'company', label: '企業', icon: Building2 },
] as const;

export function ActivitySenderOptions({
  sender,
  onChange,
}: {
  sender: ActivitySender;
  onChange: (sender: ActivitySender) => void;
}) {
  return (
    <DropdownMenu.RadioGroup
      value={sender}
      onValueChange={(value) => onChange(value as ActivitySender)}
      aria-label="発信者"
    >
      {senders.map(({ value, label, icon: Icon }) => (
        <DropdownMenu.RadioItem
          key={value}
          value={value}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[var(--text)] outline-none data-[highlighted]:bg-[var(--accent-soft)] data-[highlighted]:text-[var(--accent)]"
        >
          <Icon aria-hidden="true" className="size-4" />
          {label}
          <DropdownMenu.ItemIndicator className="ml-auto">
            <Check aria-hidden="true" className="size-3.5" />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}
