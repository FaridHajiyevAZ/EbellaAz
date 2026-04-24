import { PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' } as const;

  return createPortal(
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="relative mx-auto mt-[8vh] animate-scale-in"
      >
        <div
          className={cn(
            'relative mx-4 overflow-hidden rounded-lg bg-surface shadow-pop',
            widths[size],
            'sm:mx-auto',
          )}
        >
          {title && (
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                {title && (
                  <h2 id="modal-title" className="font-display text-heading text-fg">
                    {title}
                  </h2>
                )}
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="px-5 py-5">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
