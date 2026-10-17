import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect, useSyncExternalStore } from 'react';
import {
  dismissToast,
  getToasts,
  subscribeToToasts,
  type ToastMessage,
} from './toast';

function ToastItem({ item }: { item: ToastMessage }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(item.id), 6000);
    return () => window.clearTimeout(timer);
  }, [item.id]);

  const Icon = item.variant === 'error' ? CircleAlert : CircleCheck;
  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex items-start gap-3 border border-[var(--line-strong)] bg-[var(--panel-raised)] p-4 text-sm text-[var(--text-strong)] shadow-[0_10px_28px_var(--shadow)]"
    >
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
      />
      <p className="min-w-0 flex-1 break-words">{item.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="通知を閉じる"
        className="shrink-0 cursor-pointer text-[var(--muted)] hover:text-[var(--accent)]"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

export function ToastViewport() {
  const messages = useSyncExternalStore(subscribeToToasts, getToasts);
  return (
    <div
      aria-label="通知"
      className="pointer-events-none fixed top-20 right-4 left-4 z-[100] flex flex-col gap-3 sm:left-auto sm:w-96"
    >
      {messages.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  );
}
