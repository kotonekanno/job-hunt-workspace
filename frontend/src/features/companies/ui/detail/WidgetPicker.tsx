import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  widgetLabels,
  type WidgetType,
} from "@/features/companies/model/companyDetail";
import { FloatingAddButton } from "@/shared/button";

type WidgetPickerProps = {
  hiddenWidgets: WidgetType[];
  onAdd: (widget: WidgetType) => void;
};

export function WidgetPicker({ hiddenWidgets, onAdd }: WidgetPickerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (
        !menuRef.current?.contains(target) &&
        !target.closest('[aria-label="ウィジェットを追加"]')
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <>
      <FloatingAddButton
        text="ウィジェットを追加"
        onClick={() => setIsOpen((current) => !current)}
      />

      {isOpen && (
        <div
          ref={menuRef}
          className="
            fixed right-5 bottom-20 z-30 w-56
            border border-[var(--line-strong)] bg-[var(--panel)]
            p-2 shadow-[0_12px_32px_var(--shadow)]
          "
        >
          {hiddenWidgets.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-[var(--faint)]">
              すべて表示されています
            </p>
          ) : hiddenWidgets.map((widget) => (
            <button
              key={widget}
              type="button"
              onClick={() => {
                onAdd(widget);
                setIsOpen(false);
              }}
              className="
                flex w-full cursor-pointer items-center gap-2
                border-l-2 border-transparent px-3 py-2.5
                text-left text-xs text-[var(--muted)]
                hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]
                hover:text-[var(--text-strong)]
              "
            >
              <Plus className="size-3.5" />
              {widgetLabels[widget]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
