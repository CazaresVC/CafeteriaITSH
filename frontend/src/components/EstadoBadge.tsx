import { cn } from '../lib/utils';

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: 'bg-status-pending',
  Pagado: 'bg-status-paid',
  'En preparación': 'bg-status-preparing',
  Listo: 'bg-status-ready',
  Entregado: 'bg-status-delivered',
  Cancelado: 'bg-status-cancelled',
};

interface Props {
  estado: string;
  className?: string;
}

export function EstadoBadge({ estado, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm',
        COLOR_ESTADO[estado] ?? 'bg-outline',
        className,
      )}
    >
      {estado}
    </span>
  );
}
