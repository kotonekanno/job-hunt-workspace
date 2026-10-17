export type ToastMessage = {
  id: string;
  message: string;
  variant: 'error' | 'success';
};

let messages: ToastMessage[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: string) {
  messages = messages.filter((message) => message.id !== id);
  emit();
}

function show(
  message: string,
  variant: ToastMessage['variant'],
  id: string = crypto.randomUUID(),
) {
  if (messages.some((item) => item.id === id)) return;
  messages = [...messages.slice(-2), { id, message, variant }];
  emit();
}

export const toast = {
  error: (message: string, id?: string) => show(message, 'error', id),
  success: (message: string, id?: string) => show(message, 'success', id),
};

export function subscribeToToasts(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts() {
  return messages;
}
