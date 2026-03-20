import { cn } from '@/shared/utils';
import { X } from 'lucide-react';
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (closeOnOverlayClick && !panelRef.current?.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-full flex flex-col max-h-[calc(100vh-2rem)] rounded-xl bg-surface shadow-xl',
          'animate-zoom-in',
          sizeClasses[size],
        )}
      >
        {/* Header */}
        {title && (
          <div className="shrink-0 flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="mt-0.5 text-sm text-secondary-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
