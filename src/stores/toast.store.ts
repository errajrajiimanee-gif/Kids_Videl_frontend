import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timeoutMs?: number;
};

type ToastState = {
  toasts: Toast[];
  add: (t: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (t) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, timeoutMs: 3000, ...t };
    set({ toasts: [...get().toasts, toast] });
    const timeout = toast.timeoutMs ?? 3000;
    if (timeout > 0) {
      window.setTimeout(() => {
        get().remove(id);
      }, timeout);
    }
    return id;
  },
  remove: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
  clear: () => set({ toasts: [] }),
}));
