import { useEffect, useRef, type ReactNode } from 'react';
import { IconoCerrar } from '../iconos';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}

export function PanelLateral({ abierto, onCerrar, titulo, children }: Props) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    }

    document.addEventListener('keydown', alTeclear);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, onCerrar]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar panel"
        onClick={onCerrar}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface-bright shadow-xl focus:outline-none"
      >
        <header className="flex items-center justify-between gap-3 border-b border-outline-variant/60 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-on-surface">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar panel"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}
