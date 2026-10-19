import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  dismissToast,
  getToasts,
  subscribeToToasts,
  type ToastMessage,
} from './toast';

function ToastItem({ item }: { item: ToastMessage }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(6000);
  const paused = hovered || focused;
  useEffect(() => {
    if (paused) return;
    const started = Date.now();
    const timer = window.setTimeout(
      () => dismissToast(item.id),
      remaining.current,
    );
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [item.id, paused]);

  const isError = item.variant === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <motion.div
      layout={!reduceMotion}
      initial={{
        opacity: 0,
        x: reduceMotion ? 0 : 24,
        y: reduceMotion ? 0 : -8,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{
        opacity: 0,
        x: reduceMotion ? 0 : 24,
        scale: reduceMotion ? 1 : 0.96,
      }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      role={isError ? 'alert' : 'status'}
      aria-atomic="true"
      className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden border border-[var(--line)] border-l-[3px] bg-[var(--panel)] p-4 text-sm text-[var(--text-strong)] shadow-[0_12px_32px_var(--shadow)] ${isError ? 'border-l-rose-500' : 'border-l-emerald-500'}`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isError ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600'}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">
          {isError ? 'エラーが発生しました' : '完了しました'}
        </p>
        <p className="mt-1.5 break-words text-xs leading-6 text-[var(--muted)]">
          {item.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="通知を閉じる"
        className="ui-control -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </motion.div>
  );
}

export function ToastViewport() {
  const messages = useSyncExternalStore(subscribeToToasts, getToasts);
  return (
    <div
      aria-label="通知"
      className="pointer-events-none fixed top-20 right-4 left-4 z-[100] flex flex-col gap-3 sm:left-auto sm:w-96"
    >
      <AnimatePresence initial={false}>
        {messages.map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
