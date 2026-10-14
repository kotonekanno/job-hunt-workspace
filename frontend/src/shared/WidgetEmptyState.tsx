export function WidgetEmptyState({ text }: { text: string }) {
  return (
    <p className="ui-empty-state border border-dashed border-[var(--line)] py-8 text-center text-xs text-[var(--faint)]">
      {text}
    </p>
  );
}
