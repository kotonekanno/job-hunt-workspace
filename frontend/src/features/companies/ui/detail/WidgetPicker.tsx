import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  widgetLabels,
  type WidgetType,
} from "@/features/companies/model/companyDetail";

type WidgetPickerProps = {
  hiddenWidgets: WidgetType[];
  onAdd: (widget: WidgetType) => void;
};

export function WidgetPicker({ hiddenWidgets, onAdd }: WidgetPickerProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        detailsRef.current?.removeAttribute("open");
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className="
          cyber-cut-sm flex h-10 list-none items-center gap-2
          bg-[var(--accent)] px-4 text-xs font-bold
          text-[var(--accent-contrast)] [&::-webkit-details-marker]:hidden"
        >
        <Plus className="size-4" />
        ウィジェットを追加
      </summary>

      <div className="absolute top-12 right-0 z-30 w-56 border border-[var(--line-strong)] bg-[var(--panel)] p-2 shadow-[0_12px_32px_var(--shadow)]">
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
              detailsRef.current?.removeAttribute("open");
            }}
            className="flex w-full items-center gap-2 border-l-2 border-transparent px-3 py-2.5 text-left text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-strong)]"
          >
            <Plus className="size-3.5" />
            {widgetLabels[widget]}
          </button>
        ))}
      </div>
    </details>
  );
}
