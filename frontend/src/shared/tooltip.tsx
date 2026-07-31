import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom";

type TooltipProps = {
  content: string;
  children: ReactNode;
  side?: TooltipSide;
};

type TooltipPosition = {
  left: number;
  top: number;
};

const viewportPadding = 8;
const tooltipGap = 7;

export function Tooltip({
  content,
  children,
  side = "top",
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;

    if (!trigger || !tooltip) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const centeredLeft = triggerRect.left + triggerRect.width / 2;
    const minimumLeft = viewportPadding + tooltipWidth / 2;
    const maximumLeft =
      window.innerWidth - viewportPadding - tooltipWidth / 2;

    setPosition({
      left: Math.min(Math.max(centeredLeft, minimumLeft), maximumLeft),
      top:
        side === "top"
          ? triggerRect.top - tooltipGap
          : triggerRect.bottom + tooltipGap,
    });
  }, [side]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return (
    <span
      ref={triggerRef}
      className="inline-flex shrink-0"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocusCapture={() => setIsOpen(true)}
      onBlurCapture={() => setIsOpen(false)}
    >
      {children}

      {isOpen &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              visibility: position ? "visible" : "hidden",
              transform:
                side === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
            className="
              ui-floating-surface pointer-events-none fixed z-[100]
              max-w-[min(20rem,calc(100vw-1rem))] animate-in
              whitespace-nowrap px-2.5 py-1.5 text-[9px] font-bold
              tracking-wide text-[var(--text-strong)] fade-in zoom-in-95
              duration-150
            "
          >
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}
