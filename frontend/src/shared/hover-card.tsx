import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type HoverCardPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

type HoverCardProps = {
  trigger: ReactNode;
  children: ReactNode;

  sizeClassName: string;
  triggerClassName?: string;

  placement?: HoverCardPlacement;
  offset?: number;
  hoverCloseDelay?: number;
  openOnHover?: boolean;
  closeOnContentClick?: boolean;
};

type CardPosition = {
  top: number;
  left: number;
};

export function HoverCard({
  trigger,
  children,
  sizeClassName,
  triggerClassName = "inline-block",
  placement = "bottom-start",
  offset = 2,
  hoverCloseDelay = 80,
  openOnHover = true,
  closeOnContentClick = false,
}: HoverCardProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<CardPosition>({
    top: 0,
    left: 0,
  });

  const isVisible = (openOnHover && isHovered) || isPinned;

  function clearCloseTimer() {
    if (!closeTimerRef.current) return;

    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function handleMouseEnter() {
    clearCloseTimer();
    setIsHovered(true);
  }

  function handleMouseLeave() {
    clearCloseTimer();

    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, hoverCloseDelay);
  }

  function updatePosition() {
    const triggerElement = triggerRef.current;
    const cardElement = cardRef.current;

    if (!triggerElement) return;

    const triggerRect = triggerElement.getBoundingClientRect();
    const cardWidth = cardElement?.offsetWidth ?? 0;
    const cardHeight = cardElement?.offsetHeight ?? 0;

    const isTop = placement.startsWith("top");
    const isEnd = placement.endsWith("end");

    setPosition({
      top: isTop
        ? triggerRect.top - cardHeight - offset
        : triggerRect.bottom + offset,
      left: isEnd
        ? triggerRect.right - cardWidth
        : triggerRect.left,
    });
  }

  useLayoutEffect(() => {
    if (!isVisible) return;

    updatePosition();
  }, [isVisible, placement, offset, children]);

  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isVisible, placement, offset]);

  useEffect(() => {
    if (!isPinned) return;

    function handleOutsideMouseDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (
        target instanceof Element
        && target.closest('[role="dialog"], [role="alertdialog"]')
      ) return;
      if (triggerRef.current?.contains(target)) return;
      if (cardRef.current?.contains(target)) return;

      setIsPinned(false);
      setIsHovered(false);
    }

    document.addEventListener("mousedown", handleOutsideMouseDown, true);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideMouseDown,
        true,
      );
    };
  }, [isPinned]);

  useEffect(() => {
    return clearCloseTimer;
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={triggerClassName}
        role={openOnHover ? undefined : "button"}
        tabIndex={openOnHover ? undefined : 0}
        aria-expanded={openOnHover ? undefined : isPinned}
        onMouseEnter={openOnHover ? handleMouseEnter : undefined}
        onMouseLeave={openOnHover ? handleMouseLeave : undefined}
        onClick={() => setIsPinned((current) => !current)}
        onKeyDown={(event) => {
          if (openOnHover) {
            return;
          }

          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          setIsPinned((current) => !current);
        }}
      >
        {trigger}
      </div>

      {isVisible &&
        createPortal(
          <div
            ref={cardRef}
            onMouseEnter={openOnHover ? handleMouseEnter : undefined}
            onMouseLeave={openOnHover ? handleMouseLeave : undefined}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();

              if (closeOnContentClick) {
                setIsPinned(false);
                setIsHovered(false);
              }
            }}
            className={`
              fixed z-[9999] cursor-default
              border border-[var(--line-strong)]
              bg-[var(--panel)] p-3 text-left
              shadow-[0_10px_28px_var(--shadow)]
              ${sizeClassName}
            `}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
