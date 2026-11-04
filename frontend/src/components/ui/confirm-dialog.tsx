import { useEffect, useId, useRef } from 'react';
import { Button } from './button';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: 'primary' | 'danger';
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'primary',
  onConfirmar,
  onCancelar,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const cancelarRef = useRef<HTMLButtonElement>(null);
  const previoRef = useRef<HTMLElement | null>(null);
  const cancelarActual = useRef(onCancelar);
  const tituloId = useId();
  const mensajeId = useId();

  useEffect(() => {
    cancelarActual.current = onCancelar;
  }, [onCancelar]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    previoRef.current = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelarRef.current?.focus();

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        cancelarActual.current();
        return;
      }

      if (evento.key !== 'Tab') {
        return;
      }

      const enfocables = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((elemento) => !elemento.hasAttribute('disabled'));

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (!primero || !ultimo) {
        evento.preventDefault();
        return;
      }

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
      previoRef.current?.focus();
    };
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) {
          onCancelar();
        }
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={mensajeId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-xl focus:outline-none"
      >
        <h2 id={tituloId} className="font-heading text-lg font-bold text-on-surface">
          {titulo}
        </h2>
        <p id={mensajeId} className="mt-2 text-sm text-on-surface-variant">
          {mensaje}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button ref={cancelarRef} variante="secondary" onClick={onCancelar}>
            {textoCancelar}
          </Button>
          <Button variante={variante} onClick={onConfirmar}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
}
