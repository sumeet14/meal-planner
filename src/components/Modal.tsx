import { useEffect, type ReactNode } from 'react';

export function Modal({ title, onClose, children, side = false, wide = false }: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Render as a right-hand drawer instead of a centred dialog. */
  side?: boolean;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex bg-slate-900/30" onMouseDown={onClose}>
      <div
        className={
          side
            ? 'ml-auto flex h-full w-full max-w-xl flex-col bg-white shadow-xl'
            : `m-auto flex max-h-[90vh] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} flex-col rounded-lg bg-white shadow-xl`
        }
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-ghost px-2" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
