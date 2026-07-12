type Props = {
  value: any;
  items: any[];
  onChange: (value: any) => void;
}

export function Select({ value, items, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="
        h-9 border border-[var(--line)] bg-[var(--panel-raised)]
        px-3 text-xs text-[var(--text)] outline-none transition-colors
        focus:border-[var(--accent)]
      "
    >
      {items.map((item) =>
        <option key={item} value={item}>
          {item}
        </option>
      )}
    </select>
  );
}