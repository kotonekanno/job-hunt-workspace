import {
  Archive,
  Check,
  CircleOff,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Size } from "@/shared/shared-type";

type PriorityBadgeProps = {
  priority: number | null;
  size: Size;
  onChange?: (priority: number | null) => void;
};

type Priority = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const priorityTexts = [
  "未分類",
  "第１志望",
  "第２志望",
  "第３志望",
  "第４志望",
  "第５志望",
  "アーカイブ",
] as const;

const priorityOptions = [
  {
    label: "第１志望",
    value: 1,
  },
  {
    label: "第２志望",
    value: 2,
  },
  {
    label: "第３志望",
    value: 3,
  },
  {
    label: "第４志望",
    value: 4,
  },
  {
    label: "第５志望",
    value: 5,
  },
  {
    label: "未分類",
    value: 0,
  },
  {
    label: "アーカイブ",
    value: 6,
  },
] as const;

const colorStyle: Record<Priority, string> = {
  0: "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]",
  1: "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]",
  2: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]",
  3: "border-[var(--line-strong)] bg-[var(--panel-raised)] text-[var(--text-strong)]",
  4: "border-[var(--line)] bg-[var(--panel-raised)] text-[var(--muted)]",
  5: "border-[var(--line)] bg-transparent text-[var(--faint)]",
  6: "border-[var(--line)] bg-transparent text-[var(--faint)] opacity-75",
};

const hoverColorStyle: Record<Priority, string> = {
  0: "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  1: "hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  2: "hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]",
  3: "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  4: "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  5: "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
  6: "hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:opacity-100",
};

export function PriorityBadge({
  priority,
  size,
  onChange,
}: PriorityBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [selectedPriority, setSelectedPriority] = useState(priority);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const normalizedPriority: Priority =
    selectedPriority === null ? 0 : selectedPriority as Priority;

  const text = priorityTexts[normalizedPriority];
  const badgeStyle = colorStyle[normalizedPriority];
  const badgeHoverStyle = hoverColorStyle[normalizedPriority];
  const sizeStyle = size === "s"
    ? "w-16 px-2 py-1 text-[9px]"
    : "w-24 px-3 py-1.5 text-xs";

  useEffect(() => {
    setSelectedPriority(priority);
  }, [priority]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const updateMenuPosition = () => {
    const triggerRect = containerRef.current?.getBoundingClientRect();

    if (!triggerRect) return;

    const menuWidth = menuRef.current?.offsetWidth ?? 192;
    const viewportPadding = 8;
    const preferredLeft = triggerRect.left;
    const maximumLeft =
      window.innerWidth - menuWidth - viewportPadding;

    setMenuPosition({
      top: triggerRect.bottom + 6,
      left: Math.max(
        viewportPadding,
        Math.min(preferredLeft, maximumLeft),
      ),
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener(
      "scroll",
      updateMenuPosition,
      true,
    );
    window.addEventListener("resize", updateMenuPosition);

    return () => {
      window.removeEventListener(
        "scroll",
        updateMenuPosition,
        true,
      );
      window.removeEventListener(
        "resize",
        updateMenuPosition,
      );
    };
  }, [isOpen]);

  const selectPriority = (nextPriority: number) => {
    setSelectedPriority(nextPriority);
    setIsOpen(false);
    onChange?.(nextPriority);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex shrink-0"
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex cursor-pointer items-center justify-center border font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${badgeStyle} ${badgeHoverStyle} ${sizeStyle}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {text}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="志望度を選択"
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className="fixed z-[9999] w-48 border border-[var(--line-strong)] bg-[var(--panel)] p-1.5 shadow-[0_12px_32px_var(--shadow)]"
            style={menuPosition}
          >
            <div className="border-b border-[var(--line)] px-2 py-2">
              <p className="font-mono text-[8px] font-bold tracking-[0.16em] text-[var(--accent)]">
                PRIORITY
              </p>
            </div>

            <div className="mt-1 space-y-0.5">
              {priorityOptions.map((option) => {
                const isSelected =
                  selectedPriority === option.value;
                const isArchive = option.value === 6;
                const isUnassigned = option.value === 0;

                const OptionIcon = isArchive
                  ? Archive
                  : isUnassigned
                    ? CircleOff
                    : null;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() =>
                      selectPriority(option.value)
                    }
                    className={`flex w-full cursor-pointer items-center gap-2 border-l-2 px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-strong)]"
                        : "border-transparent text-[var(--muted)] hover:border-[var(--line-strong)] hover:bg-[var(--panel-raised)] hover:text-[var(--text-strong)]"
                    }`}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center font-mono text-[8px] font-black ${
                        isSelected
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                          : "bg-[var(--panel-raised)] text-[var(--faint)]"
                      }`}
                    >
                      {OptionIcon ? (
                        <OptionIcon className="size-3" />
                      ) : (
                        option.value
                      )}
                    </span>

                    <span className="min-w-0 flex-1 text-[10px] font-bold">
                      {option.label}
                    </span>

                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-[var(--accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
