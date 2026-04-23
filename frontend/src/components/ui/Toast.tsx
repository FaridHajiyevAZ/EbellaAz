import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastKind = 'success' | 'error' | 'info';

interface ToastInput {
  kind?: ToastKind;
  title?: string;
  message: string;
  durationMs?: number;
}

interface Toast extends ToastInput {
  id: string;
}

interface ToastContextValue {
  show: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * App-wide toast provider. Stack renders top-right on desktop and slides
 * up from the bottom on mobile. Each toast auto-dismisses after its
 * duration (default 4s) and can be dismissed manually.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback(
    (id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)),
    [],
  );

  const show = useCallback(
    (t: ToastInput) => {
      const id = cryptoRandomId();
      setToasts((ts) => [...ts, { kind: 'info', durationMs: 4000, ...t, id }]);
      return id;
    },
    [],
  );

  const value = useMemo<ToastContextValue>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col gap-2 sm:inset-auto sm:right-4 sm:top-4 sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const h = window.setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 4000);
    return () => window.clearTimeout(h);
  }, [toast.id, toast.durationMs, onDismiss]);

  const kind = toast.kind ?? 'info';
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-md border bg-surface p-3 shadow-pop animate-fade-in',
        kind === 'success' && 'border-success/30',
        kind === 'error'   && 'border-danger/30',
        kind === 'info'    && 'border-border',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0',
          kind === 'success' && 'text-success',
          kind === 'error'   && 'text-danger',
          kind === 'info'    && 'text-muted',
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-sm">
        {toast.title && <div className="font-medium text-fg">{toast.title}</div>}
        <div className={cn('text-fg', toast.title && 'text-muted')}>{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="focus-ring -mr-1 -mt-1 rounded p-1 text-muted hover:text-fg"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Typed API over the bare context for ergonomic usage. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return {
    success: (message: string, title?: string) => ctx.show({ kind: 'success', message, title }),
    error:   (message: string, title?: string) => ctx.show({ kind: 'error',   message, title }),
    info:    (message: string, title?: string) => ctx.show({ kind: 'info',    message, title }),
    show:    ctx.show,
    dismiss: ctx.dismiss,
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
