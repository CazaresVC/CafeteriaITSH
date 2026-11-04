import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMenu } from '../../lib/menu';
import {
  useCambiarEstado,
  useCobrarPedido,
  useCrearMostrador,
  usePedidos,
  type Pedido,
} from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { PedidoMostrador, type ResumenMostrador } from '../../components/caja/PedidoMostrador';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { EstadoBadge } from '../../components/EstadoBadge';
import {
  IconoAgregar,
  IconoCaja,
  IconoCerrar,
  IconoEntregas,
  IconoPago,
  IconoQuitar,
  IconoReloj,
} from '../../components/iconos';

type Paso = 'inicio' | 'captura' | 'cobro' | 'resultado';

const PASOS: Paso[] = ['inicio', 'captura', 'cobro', 'resultado'];

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function fechaLarga(): string {
  return new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function Caja() {
  const [parametros, setParametros] = useSearchParams();
  const pasoParametro = parametros.get('paso') as Paso | null;
  const paso: Paso = pasoParametro && PASOS.includes(pasoParametro) ? pasoParametro : 'inicio';

  const { data: items, isLoading, isError, refetch } = useMenu();
  const { data: listos } = usePedidos({ estados: ['Listo'], refetchInterval: 5000 });
  const crearMostrador = useCrearMostrador();
  const cobrar = useCobrarPedido();
  const cambiarEstado = useCambiarEstado();

  const [seleccion, setSeleccion] = useState<ResumenMostrador | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendientes = listos?.length ?? 0;

  const pedidoActual =
    pedidoCreado && cobrar.data && cobrar.data.id === pedidoCreado.id
      ? cobrar.data
      : pedidoCreado;

  function ir(destino: Paso) {
    if (destino === 'inicio') {
      setParametros({}, { replace: true });
    } else {
      setParametros({ paso: destino }, { replace: true });
    }
  }

  function continuar(resumen: ResumenMostrador) {
    setSeleccion(resumen);
    setError(null);
    ir('cobro');
  }

  function quitarLinea(id: number) {
    setSeleccion((actual) => {
      if (!actual) {
        return actual;
      }
      const lineas = actual.lineas.filter((linea) => linea.id !== id);
      if (lineas.length === 0) {
        return null;
      }
      const total = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);
      return {
        datos: {
          ...actual.datos,
          items: lineas.map((linea) => ({ menu_dia_id: linea.id, cantidad: linea.cantidad })),
        },
        lineas,
        total,
      };
    });
  }

  function registrarYCobrar() {
    if (!seleccion) {
      return;
    }
    setError(null);
    crearMostrador.mutate(seleccion.datos, {
      onSuccess: (nuevo) => {
        setPedidoCreado(nuevo);
        ir('resultado');
        cobrar.mutate(nuevo.id);
      },
      onError: (e) => setError(mensajeDeError(e)),
    });
  }

  function reintentarCobro() {
    if (!pedidoActual) {
      return;
    }
    setError(null);
    cobrar.reset();
    cobrar.mutate(pedidoActual.id);
  }

  function cancelarPedido() {
    if (!pedidoActual) {
      return;
    }
    setError(null);
    cambiarEstado.mutate(
      { id: pedidoActual.id, estado: 'Cancelado' },
      {
        onSuccess: () => reiniciar(),
        onError: (e) => setError(mensajeDeError(e)),
      },
    );
  }

  function reiniciar() {
    setSeleccion(null);
    setPedidoCreado(null);
    setError(null);
    crearMostrador.reset();
    cobrar.reset();
    cambiarEstado.reset();
    ir('captura');
  }

  const seleccionInicial = seleccion
    ? Object.fromEntries(seleccion.lineas.map((linea) => [linea.id, linea.cantidad]))
    : {};

  return (
    <div className="space-y-6">
      {paso === 'inicio' && (
        <>
          <PageHeader
            icono={<IconoCaja className="h-5 w-5" />}
            titulo="Cafetería ITSH · Caja"
            descripcion={`${fechaLarga()} · Captura pedidos de mostrador y cobra en efectivo.`}
          />

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-container/50 p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary">
                <IconoAgregar className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-bold text-on-surface">Capturar pedido</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Busca productos, ajusta cantidades y cobra en un solo paso.
              </p>
              <Button onClick={() => ir('captura')} className="mt-4 min-h-12 w-full text-base">
                Nuevo pedido
              </Button>
            </div>

            <Link
              to="/caja/entregas"
              className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-ready/12 text-status-ready">
                  <IconoEntregas className="h-6 w-6" />
                </span>
                {pendientes > 0 && <Badge tono="info">{pendientes} pendiente(s)</Badge>}
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-on-surface">Entregas</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Revisa los pedidos que cocina ya marcó como listos.
              </p>
              <span className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary">
                Ver pedidos listos →
              </span>
            </Link>
          </section>

          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container p-6">
            <p className="font-heading text-lg font-bold text-on-surface">
              ¡Buen día! Tu café, en buenas manos.
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              El pedido se registra y cobra en un solo paso para enviarlo a cocina.
            </p>
          </div>
        </>
      )}

      {paso === 'captura' && (
        <>
          <PageHeader
            icono={<IconoCaja className="h-5 w-5" />}
            titulo="Nuevo pedido"
            descripcion="Selecciona los productos del menú de hoy."
            acciones={
              <Button variante="ghost" onClick={() => ir('inicio')}>
                ← Inicio
              </Button>
            }
          />

          {isLoading && (
            <p className="text-sm text-on-surface-variant" role="status">
              Cargando menú…
            </p>
          )}

          {isError && (
            <div className="space-y-3 rounded-xl border border-error/30 bg-error-container/40 p-4">
              <p className="text-sm text-error" role="alert">
                No se pudo cargar el menú de hoy.
              </p>
              <Button variante="secondary" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          )}

          {items && !isLoading && !isError && (
            <PedidoMostrador
              items={items}
              onContinuar={continuar}
              seleccionInicial={seleccionInicial}
              clienteInicial={seleccion?.datos.cliente_nombre ?? ''}
            />
          )}
        </>
      )}

      {paso === 'cobro' && (
        <>
          <PageHeader
            icono={<IconoPago className="h-5 w-5" />}
            titulo="Cobro"
            descripcion="Revisa el pedido antes de registrar y cobrar en efectivo."
            acciones={
              <Button variante="ghost" onClick={() => ir('captura')}>
                ← Volver al catálogo
              </Button>
            }
          />

          {!seleccion || seleccion.lineas.length === 0 ? (
            <EmptyState
              titulo="No hay productos en el cobro"
              descripcion="Regresa al catálogo y agrega al menos un producto."
            >
              <Button onClick={() => ir('captura')} className="min-h-11">
                Ir al catálogo
              </Button>
            </EmptyState>
          ) : (
            <>
              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4 shadow-sm">
                <ul className="divide-y divide-surface-container-high">
                  {seleccion.lineas.map((linea) => (
                    <li key={linea.id} className="flex items-center gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-on-surface">
                          {linea.cantidad} × {linea.nombre}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {formatearPrecio(linea.precio)} c/u
                        </p>
                      </div>
                      <span className="font-heading text-lg font-bold text-on-surface">
                        {formatearPrecio(linea.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => quitarLinea(linea.id)}
                        aria-label={`Quitar ${linea.nombre}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <IconoQuitar className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex items-center justify-between border-t border-surface-container-high pt-4">
                  <span className="text-sm font-medium text-on-surface-variant">Total</span>
                  <span className="font-heading text-4xl font-extrabold tracking-tight text-primary">
                    {formatearPrecio(seleccion.total)}
                  </span>
                </div>
              </div>

              <p className="flex items-start gap-2 rounded-xl bg-surface-container p-4 text-sm text-on-surface-variant">
                <IconoReloj className="mt-0.5 h-4 w-4 shrink-0" />
                El pedido se registra y cobra en un solo paso.
              </p>

              {error && (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}

              <Button
                onClick={registrarYCobrar}
                disabled={crearMostrador.isPending || cobrar.isPending}
                className="min-h-12 w-full text-base"
              >
                <IconoPago className="h-5 w-5" />
                {crearMostrador.isPending ? 'Registrando pedido…' : 'Registrar y cobrar'}
              </Button>
            </>
          )}
        </>
      )}

      {paso === 'resultado' && (
        <>
          <PageHeader
            icono={<IconoPago className="h-5 w-5" />}
            titulo="Resultado del cobro"
            descripcion="Confirma el estado del pedido antes de continuar."
          />

          {!pedidoActual ? (
            <EmptyState
              titulo="No hay un cobro en curso"
              descripcion="Inicia un nuevo pedido desde el catálogo."
            >
              <Button onClick={() => ir('captura')} className="min-h-11">
                Nuevo pedido
              </Button>
            </EmptyState>
          ) : pedidoActual.estado === 'Pagado' ? (
            <div className="rounded-2xl border border-status-delivered/30 bg-status-delivered/8 p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-delivered text-white">
                <IconoPago className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-heading text-2xl font-extrabold text-on-surface">
                Cobro confirmado
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Pedido {pedidoActual.numero} enviado a cocina.
              </p>
              <p className="mt-4 font-mono text-2xl font-bold tracking-tight text-on-surface">
                {pedidoActual.numero}
              </p>
              <div className="mt-4 flex justify-center">
                <EstadoBadge estado={pedidoActual.estado} />
              </div>
              <p className="mt-4 font-heading text-3xl font-extrabold text-primary">
                {formatearPrecio(pedidoActual.total)}
              </p>
              <Button onClick={reiniciar} className="mt-6 min-h-12 w-full text-base sm:max-w-xs">
                <IconoAgregar className="h-5 w-5" />
                Nuevo pedido
              </Button>
            </div>
          ) : cobrar.isError ? (
            <div className="rounded-2xl border border-error/30 bg-error-container/40 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error text-on-error">
                <IconoCerrar className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-bold text-on-surface">
                No se pudo completar el cobro
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                El pedido quedó <strong>Pendiente</strong> con folio{' '}
                <span className="font-mono font-semibold">{pedidoActual.numero}</span>. Puedes
                reintentar sin capturarlo de nuevo.
              </p>
              <p className="mt-3 text-sm text-error" role="alert">
                {error ?? mensajeDeError(cobrar.error)}
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={reintentarCobro}
                  disabled={cobrar.isPending}
                  className="min-h-12 text-base"
                >
                  <IconoPago className="h-5 w-5" />
                  {cobrar.isPending ? 'Reintentando…' : 'Reintentar cobro'}
                </Button>
                <Button
                  variante="secondary"
                  onClick={cancelarPedido}
                  disabled={cambiarEstado.isPending}
                  className="min-h-12 text-base"
                >
                  <IconoCerrar className="h-5 w-5" />
                  Cancelar pedido
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 text-center">
              <p className="font-heading text-xl font-bold text-on-surface">Procesando cobro…</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Folio <span className="font-mono">{pedidoActual.numero}</span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
