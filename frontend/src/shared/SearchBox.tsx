import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type SearchBoxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size" | "type" | "value"
> & {
  value: string;
  onValueChange: (value: string) => void;
  size?: "s" | "m";
};

export function SearchBox({
  value,
  onValueChange,
  size = "m",
  className = "",
  ...props
}: SearchBoxProps) {
  const sizeClassName = size === "s"
    ? "h-8 pl-8 pr-2 text-[10px]"
    : "h-10 pl-9 pr-3 text-sm";
  const iconClassName = size === "s"
    ? "left-2.5 size-3.5"
    : "left-3 size-4";

  return (
    <label className={`relative block min-w-0 ${className}`}>
      <Search
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--faint)] ${iconClassName}`}
      />

      <input
        {...props}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={`
          w-full cursor-text border border-[var(--line)]
          bg-[var(--panel-raised)] text-[var(--text)] outline-none
          transition-colors placeholder:text-[var(--faint)]
          hover:border-[var(--line-strong)] focus:border-[var(--accent)]
          ${sizeClassName}
        `}
      />
    </label>
  );
}
