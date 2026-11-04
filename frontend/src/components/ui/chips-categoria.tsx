import { cn } from '../../lib/utils';

interface Props {
  categorias: string[];
  seleccionada: string | null;
  onSeleccionar: (categoria: string | null) => void;
}

export function ChipsCategoria({ categorias, seleccionada, onSeleccionar }: Props) {
  if (categorias.length === 0) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {[null, ...categorias].map((categoria) => {
        const activa = seleccionada === categoria;
        return (
          <button
            key={categoria ?? 'todas'}
            type="button"
            aria-pressed={activa}
            onClick={() => onSeleccionar(categoria)}
            className={cn(
              'min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              activa
                ? 'bg-primary text-on-primary shadow-sm'
                : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50 hover:text-on-surface',
            )}
          >
            {categoria ?? 'Todas'}
          </button>
        );
      })}
    </div>
  );
}
