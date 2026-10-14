import { Check, NotebookPen, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { InlineTextarea } from '@/shared/InlineTextarea';

import { WidgetFrame } from '@/features/companies/ui/detail/WidgetFrame';
import { EditIconButton, IconActionButton } from '@/shared/button';

type QuickMemoWidgetProps = {
  onRemove: () => void;
};

const initialMemo =
  '最終面接では、プロダクトの今後の展開と配属後の役割を確認する。';

export function QuickMemoWidget({ onRemove }: QuickMemoWidgetProps) {
  const [memo, setMemo] = useState(initialMemo);
  const [draft, setDraft] = useState(initialMemo);
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(144);

  function startEditing() {
    setHeight(contentRef.current?.getBoundingClientRect().height ?? 144);
    setDraft(memo);
    setIsEditing(true);
  }

  function saveMemo() {
    setMemo(draft);
    setIsEditing(false);
  }

  function cancelEditing() {
    setDraft(memo);
    setIsEditing(false);
  }

  const action = isEditing ? (
    <div className="flex items-center gap-1">
      <IconActionButton
        icon={Check}
        size="m"
        transparent={true}
        onClick={saveMemo}
        ariaLabel="メモを保存"
      />

      <IconActionButton
        icon={X}
        size="m"
        transparent={true}
        onClick={cancelEditing}
        ariaLabel="編集をキャンセル"
      />
    </div>
  ) : (
    <EditIconButton
      size="m"
      transparent={true}
      onClick={startEditing}
      ariaLabel="メモを編集"
    />
  );

  return (
    <WidgetFrame
      title="メモ"
      code="NOTE"
      icon={NotebookPen}
      action={action}
      onRemove={onRemove}
      className="quick-memo-widget"
    >
      {isEditing ? (
        <InlineTextarea
          initialHeight={height}
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              cancelEditing();
            }

            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              saveMemo();
            }
          }}
          aria-label="簡易メモを編集"
          className="block w-full cursor-text resize-none overflow-hidden border-0 bg-[var(--panel)]/70 py-1 pl-4 pr-2 text-sm leading-7 text-[var(--text)] outline outline-1 outline-[var(--accent)]"
          placeholder="企業について覚えておきたいことを入力"
        />
      ) : (
        <div ref={contentRef} className="relative min-h-36 py-1 pl-4 pr-2">
          <p
            className={
              memo
                ? 'whitespace-pre-wrap text-sm leading-7 text-[var(--text)]'
                : 'whitespace-pre-wrap text-sm leading-7 text-[var(--muted)]'
            }
          >
            {memo || 'メモはまだありません。編集ボタンから入力できます。'}
          </p>
        </div>
      )}
    </WidgetFrame>
  );
}
