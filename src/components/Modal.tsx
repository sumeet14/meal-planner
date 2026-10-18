import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * Dialog that rises as a bottom sheet on small screens. On wider screens it is
 * a centred dialog, or a right-hand drawer with `side`.
 */
export function Modal({ title, subtitle, onClose, children, footer, side = false, wide = false }: {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Pinned below the scrolling content, for the dialog's main actions. */
  footer?: ReactNode;
  side?: boolean;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const shape = side
    ? 'md:ml-auto md:h-full md:max-h-none md:max-w-xl md:rounded-none md:animate-[drawer_.22s_ease-out]'
    : `md:m-auto md:max-h-[88vh] md:rounded-2xl ${wide ? 'md:max-w-3xl' : 'md:max-w-lg'}`;

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-ink/40 md:items-stretch md:p-0" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog" aria-modal="true" tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-surface shadow-[0_10px_40px_rgba(29,43,40,0.25)] focus:outline-none animate-[sheet_.22s_ease-out] ${shape}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-5 pb-3 pt-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">{title}</h2>
            {subtitle && <div className="mt-0.5 text-sm text-ink-2">{subtitle}</div>}
          </div>
          <button className="btn-icon -mr-2 -mt-1" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="flex-1 overflow-auto px-5 pb-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
