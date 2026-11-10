import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../i18n';
import { CloseIcon } from './icons';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

/** Accessible dialog shell: Escape and backdrop close it, focus moves in and is restored on close. */
export function Modal({ open, onClose, labelledBy, children }: ModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return createPortal(
    <div
      className={`mb ${open ? 'open' : ''}`}
      inert={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="md" role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} ref={dialogRef}>
        <button type="button" className="mx" onClick={onClose} aria-label={t.wallet.close}>
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
