import type { Pedido } from '../../lib/pedidos';
import { EstadoBadge } from '../EstadoBadge';
import { BotonEstado } from '../BotonEstado';
import {
  IconoCerrar,
  IconoCocina,
  IconoCheck,
  IconoEntregar,
  IconoReloj,
} from '../iconos';
import { cn } from '../../lib/utils';

const SIGUIENTE: Record<string, string> = {
  Pagado: 'En preparación',
  'En preparación': 'Listo',
  Listo: 'Entregado',
};

const ETIQUETA_ACCION: Record<string, string> = {
  Pagado: 'Iniciar preparación',
  'En preparación': 'Marcar listo',
  Listo: 'Marcar entregado',
};

const CANCELABLES = ['Pendiente', 'Pagado', 'En preparación', 'Listo'];

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function minutosEspera(creadoEn: string): number | null {
  const inicio = new Date(creadoEn.replace(' ', 'T')).getTime();
  if (Number.isNaN(inicio)) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - inicio) / 60000));
}

function tiempoEspera(minutos: number | null): string {
  if (minutos === null) {
    return '';
  }
  if (minutos < 1) {
    return 'recién llegado';
  }
  return `hace ${minutos} min`;
}

function iconoAccion(estado: string) {
  if (estado === 'Pagado') {
    return <IconoCocina className="h-5 w-5" />;
  }
  if (estado === 'En preparación') {
    return <IconoCheck className="h-5 w-5" />;
  }
  if (estado === 'Listo') {
    return <IconoEntregar className="h-5 w-5" />;
  }
  return null;
}

function claseBorde(estado: string): string {
  if (estado === 'Listo') {
    return 'border-status-ready/50';
  }
  if (estado === 'En preparación') {
    return 'border-status-preparing/40';
  }
  return 'border-outline-variant/70';
}

interface Props {
  pedido: Pedido;
  onCambiar: (estado: string) => void;
  enviando?: boolean;
}

export function PedidoCard({ pedido, onCambiar, enviando = false }: Props) {
  const siguiente = SIGUIENTE[pedido.estado];
  const puedeCancelar = CANCELABLES.includes(pedido.estado);
  const minutos = minutosEspera(pedido.creadoEn);
  const urgente = minutos !== null && minutos >= 15;
  const articulos = pedido.lineas.reduce((suma, linea) => suma + linea.cantidad, 0);

  return (
    <article
      aria-label={`Pedido ${pedido.numero}`}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border bg-surface-container-lowest p-4 shadow-sm',
        claseBorde(pedido.estado),
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-2xl font-extrabold tracking-tight text-on-surface">
            {pedido.numero}
          </p>
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">
            {pedido.tipo}
            {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ''}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              data-testid={`espera-${pedido.id}`}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                urgente
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-surface-container text-on-surface-variant',
              )}
            >
              <IconoReloj className="h-3.5 w-3.5" />
              {tiempoEspera(minutos)}
            </span>
            <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant">
              {articulos} artículo{articulos === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </header>

      <ul className="divide-y divide-surface-container-high text-sm">
        {pedido.lineas.map((linea) => (
          <li key={linea.id} className="flex items-center justify-between gap-2 py-2">
            <span className="font-semibold text-on-surface">
              {linea.cantidad} × {linea.nombre}
            </span>
            <span className="shrink-0 font-medium text-on-surface-variant">
              {formatearPrecio(linea.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-surface-container-high pt-2 text-sm">
        <span className="font-medium text-on-surface-variant">Total</span>
        <span className="font-heading text-lg font-bold text-on-surface">
          {formatearPrecio(pedido.total)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {siguiente && (
          <BotonEstado
            onClick={() => onCambiar(siguiente)}
            disabled={enviando}
            className="min-h-12 text-base"
          >
            {iconoAccion(pedido.estado)}
            {ETIQUETA_ACCION[pedido.estado]}
          </BotonEstado>
        )}
        {puedeCancelar && (
          <BotonEstado
            variante="danger"
            onClick={() => onCambiar('Cancelado')}
            disabled={enviando}
            className="min-h-11"
          >
            <IconoCerrar className="h-4 w-4" />
            Cancelar
          </BotonEstado>
        )}
      </div>
    </article>
  );
}
