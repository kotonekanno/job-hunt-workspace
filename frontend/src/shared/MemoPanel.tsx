export function MemoText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-[12px] leading-7 text-[var(--text)] [overflow-wrap:anywhere]">
      {text}
    </p>
  );
}

export function MemoPanel({
  text,
  recessed = false,
}: {
  text: string;
  recessed?: boolean;
}) {
  return (
    <div
      className={`border-t border-[var(--line)] px-12 py-4 ${recessed ? 'bg-[var(--panel)]' : 'bg-[var(--panel-raised)]'}`}
    >
      <MemoText text={text} />
    </div>
  );
}
