import { cn } from '../../lib/utils';

interface Props {
  cantidad: number;
  onCambiar: (delta: number) => void;
  nombre: string;
  testid?: string;
  min?: number;
  max?: number;
  deshabilitado?: boolean;
  className?: string;
}

const BOTON =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-outline bg-surface-container-lowest text-lg font-semibold text-on-surface transition-colors hover:border-primary hover:bg-primary-container/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline disabled:hover:bg-surface-container-lowest disabled:hover:text-on-surface';

export function Stepper({
  cantidad,
  onCambiar,
  nombre,
  testid,
  min = 0,
  max = 99,
  deshabilitado = false,
  className,
}: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label={`Quitar ${nombre}`}
        onClick={() => onCambiar(-1)}
        disabled={deshabilitado || cantidad <= min}
        className={BOTON}
      >
        −
      </button>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Cantidad de ${nombre}: ${cantidad}`}
        data-testid={testid}
        className="w-9 text-center font-heading text-lg font-bold tabular-nums text-on-surface"
      >
        {cantidad}
      </span>
      <button
        type="button"
        aria-label={`Agregar ${nombre}`}
        onClick={() => onCambiar(1)}
        disabled={deshabilitado || cantidad >= max}
        className={BOTON}
      >
        +
      </button>
    </div>
  );
}
