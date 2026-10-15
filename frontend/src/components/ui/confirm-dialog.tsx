import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!abierto) {
      return;
    }
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onCancelar();
      }
    }
    document.addEventListener('keydown', alTeclear);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto, onCancelar]);

  if (!abierto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4"
      onClick={onCancelar}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        onClick={(evento) => evento.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-outline-variant/70 bg-white p-6 shadow-xl focus:outline-none"
      >
        <h2 className="font-heading text-lg font-bold text-on-surface">{titulo}</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{mensaje}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="secondary" onClick={onCancelar}>
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
