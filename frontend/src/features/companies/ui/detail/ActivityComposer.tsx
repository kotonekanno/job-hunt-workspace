import { Building2, Check, Send, UserRound } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import type { ActivitySender } from '@/features/companies/model/activity';

type ActivityComposerProps = {
  onSend: (text: string, sender: ActivitySender) => void;
};

const senders = [
  { value: 'user', label: 'ユーザー', icon: UserRound },
  { value: 'company', label: '企業', icon: Building2 },
] as const;

export function ActivityComposer({ onSend }: ActivityComposerProps) {
  const [sender, setSender] = useState<ActivitySender>('user');
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const SenderIcon = sender === 'company' ? Building2 : UserRound;

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    function resize() {
      if (!input) return;
      input.style.height = '0px';
      input.style.height = `${input.scrollHeight + 2}px`;
    }
    resize();
    let width = input.clientWidth;
    const observer = new ResizeObserver(() => {
      if (input.clientWidth !== width) {
        width = input.clientWidth;
        resize();
      }
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [draft]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim(), sender);
    setDraft('');
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={submit}
      className="flex shrink-0 items-end gap-2 border-t border-[var(--line)] bg-[var(--panel)] p-3"
    >
      <textarea
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={1}
        aria-label="やりとり内容"
        placeholder="やりとりを入力…"
        className="max-h-40 min-h-10 min-w-0 flex-1 resize-none overflow-y-auto border border-[var(--line)] bg-[var(--panel-raised)] px-3 py-[9px] text-xs leading-5 text-[var(--text)] placeholder:text-[var(--faint)] focus:border-[var(--accent)]"
        onKeyDown={(event) => {
          if (
            !event.nativeEvent.isComposing &&
            event.key === 'Enter' &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={`発信者を選択（現在：${sender === 'company' ? '企業' : 'ユーザー'}）`}
            className="ui-control flex size-10 shrink-0 cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <SenderIcon aria-hidden="true" className="size-4" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="end"
            sideOffset={8}
            className="ui-floating-surface z-50 min-w-36 p-1"
          >
            <DropdownMenu.RadioGroup
              value={sender}
              onValueChange={(value) => setSender(value as ActivitySender)}
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
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <button
        type="submit"
        disabled={!draft.trim()}
        aria-label="送信"
        className="ui-control flex size-10 shrink-0 cursor-pointer items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}
