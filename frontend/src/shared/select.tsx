import type { SelectHTMLAttributes } from "react";

type SelectValue = string | number;

export type SelectOption<T extends SelectValue> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SelectProps<T extends SelectValue> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> & {
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
};

export function Select<T extends SelectValue>({
  value,
  options,
  onValueChange,
  className = "",
  ...props
}: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(event) => {
        const selectedOption = options.find(
          (option) => String(option.value) === event.target.value,
        );

        if (selectedOption) onValueChange(selectedOption.value);
      }}
      className={`
        ui-field h-9 cursor-pointer border border-[var(--line)] bg-[var(--panel-raised)]
        px-3 text-xs text-[var(--text)] outline-none transition-colors
        focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40
        hover:border-[var(--accent)] ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option
          key={String(option.value)}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function toSelectOptions<T extends SelectValue>(
  values: readonly T[],
): SelectOption<T>[] {
  return values.map((value) => ({
    value,
    label: String(value),
  }));
}
