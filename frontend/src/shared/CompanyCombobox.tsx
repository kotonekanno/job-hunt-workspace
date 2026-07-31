import {
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type CompanyComboboxProps = {
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
  allowEmpty?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  emptyLabel?: string;
  invalidMessage?: string;
  noResultsText?: string;
  clearAriaLabel?: string;
};

export function CompanyCombobox({
  value,
  options,
  onValueChange,
  allowEmpty = false,
  required = false,
  placeholder = "企業名を検索",
  className = "",
  emptyLabel = "未選択",
  invalidMessage = "一覧から項目を選択してください。",
  noResultsText = "該当する項目はありません",
  clearAriaLabel = "選択を解除する",
}: CompanyComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = options.filter((option) =>
    option.toLocaleLowerCase().includes(normalizedQuery));

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const hasConfirmedValue = query === value;
    const isEmptyAllowed = allowEmpty && !query && !value;

    input.setCustomValidity(
      hasConfirmedValue && (!required || Boolean(value)) || isEmptyAllowed
        ? ""
        : invalidMessage,
    );
  }, [allowEmpty, invalidMessage, query, required, value]);

  useEffect(() => {
    function closeOnOutsideMouseDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (rootRef.current?.contains(target)) {
        return;
      }

      setQuery(value);
      setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideMouseDown);
    };
  }, [value]);

  function selectCompany(company: string) {
    onValueChange(company);
    setQuery(company);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function clearCompany() {
    onValueChange("");
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(
        current + 1,
        filteredOptions.length - 1,
      ));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter" && isOpen && filteredOptions[activeIndex]) {
      event.preventDefault();
      selectCompany(filteredOptions[activeIndex]);
    }

    if (event.key === "Escape") {
      setQuery(value);
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        autoComplete="off"
        required={required}
        value={query}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        onFocus={(event) => {
          setIsOpen(true);
          setActiveIndex(0);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="h-10 w-full cursor-text border border-[var(--line)] bg-[var(--panel-raised)] pl-3 pr-16 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--faint)] hover:border-[var(--line-strong)] focus:border-[var(--accent)]"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {allowEmpty && value && (
          <button
            type="button"
            onClick={clearCompany}
            aria-label={clearAriaLabel}
            className="flex size-6 cursor-pointer items-center justify-center text-[var(--faint)] transition-colors hover:text-rose-500"
          >
            <X className="size-3.5" />
          </button>
        )}

        <ChevronsUpDown className="size-3.5 text-[var(--faint)]" />
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+2px)] z-[100] max-h-52 w-full overflow-y-auto border border-[var(--line-strong)] bg-[var(--panel)] p-1 shadow-[0_12px_28px_var(--shadow)]"
        >
          {allowEmpty && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearCompany}
              className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-xs text-[var(--muted)] transition-colors hover:bg-[var(--panel-raised)]"
            >
              <span className="size-3.5" />
              {emptyLabel}
            </button>
          )}

          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectCompany(option)}
              className={`flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-xs transition-colors ${
                index === activeIndex
                  ? "bg-[var(--accent-soft)] text-[var(--text-strong)]"
                  : "text-[var(--muted)] hover:bg-[var(--panel-raised)]"
              }`}
            >
              <Check
                className={`size-3.5 shrink-0 ${
                  option === value
                    ? "text-[var(--accent)]"
                    : "invisible"
                }`}
              />
              <span className="truncate">{option}</span>
            </button>
          ))}

          {filteredOptions.length === 0 && (
            <p className="px-3 py-5 text-center text-xs text-[var(--faint)]">
              {noResultsText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
