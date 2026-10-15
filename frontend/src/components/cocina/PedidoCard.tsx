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

function tiempoEspera(creadoEn: string): string {
  const inicio = new Date(creadoEn.replace(' ', 'T')).getTime();
  if (Number.isNaN(inicio)) {
    return '';
  }
  const minutos = Math.max(0, Math.floor((Date.now() - inicio) / 60000));
  if (minutos < 1) {
    return 'recién llegado';
  }
  return `hace ${minutos} min`;
}

function iconoAccion(estado: string) {
  if (estado === 'Pagado') {
    return <IconoCocina className="h-4 w-4" />;
  }
  if (estado === 'En preparación') {
    return <IconoCheck className="h-4 w-4" />;
  }
  if (estado === 'Listo') {
    return <IconoEntregar className="h-4 w-4" />;
  }
  return null;
}

interface Props {
  pedido: Pedido;
  onCambiar: (estado: string) => void;
  enviando?: boolean;
}

export function PedidoCard({ pedido, onCambiar, enviando = false }: Props) {
  const siguiente = SIGUIENTE[pedido.estado];
  const puedeCancelar = CANCELABLES.includes(pedido.estado);

  return (
    <article
      aria-label={`Pedido ${pedido.numero}`}
      className="flex flex-col gap-3 rounded-2xl border border-outline-variant/70 bg-white p-4 shadow-sm"
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-heading text-2xl font-extrabold tracking-tight text-on-surface">
            {pedido.numero}
          </p>
          <p className="text-xs uppercase tracking-wide text-on-surface-variant">
            {pedido.tipo}
            {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ''}
          </p>
          <span
            data-testid={`espera-${pedido.id}`}
            className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant"
          >
            <IconoReloj className="h-3.5 w-3.5" />
            {tiempoEspera(pedido.creadoEn)}
          </span>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </header>

      <ul className="divide-y divide-surface-container-high text-sm">
        {pedido.lineas.map((linea) => (
          <li key={linea.id} className="flex items-center justify-between py-1.5">
            <span className="text-on-surface-variant">
              {linea.cantidad} × {linea.nombre}
            </span>
            <span className="font-medium text-on-surface">{formatearPrecio(linea.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-surface-container-high pt-2 text-sm">
        <span className="font-medium text-on-surface-variant">Total</span>
        <span className="font-heading text-lg font-bold text-on-surface">
          {formatearPrecio(pedido.total)}
        </span>
      </div>

      <div className="flex gap-2">
        {siguiente && (
          <BotonEstado onClick={() => onCambiar(siguiente)} disabled={enviando}>
            {iconoAccion(pedido.estado)}
            {ETIQUETA_ACCION[pedido.estado]}
          </BotonEstado>
        )}
        {puedeCancelar && (
          <BotonEstado
            variante="danger"
            onClick={() => onCambiar('Cancelado')}
            disabled={enviando}
          >
            <IconoCerrar className="h-4 w-4" />
            Cancelar
          </BotonEstado>
        )}
      </div>
    </article>
  );
}
