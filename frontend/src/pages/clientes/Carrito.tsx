import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../lib/menu';
import { useCrearPedido, type LineaPedidoInput } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { Carrito } from '../../components/clientes/Carrito';

export function ArmarPedido() {
  const { data: items, isLoading, isError } = useMenu();
  const crearPedido = useCrearPedido();
  const navegar = useNavigate();

  async function confirmar(lineas: LineaPedidoInput[]) {
    const pedido = await crearPedido.mutateAsync(lineas);
    navegar('/pedido/pago', { state: { pedidoId: pedido.id } });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Arma tu pedido</h1>
        <p className="text-sm text-slate-500">
          Elige los platillos disponibles del menú de hoy y confirma tu pedido anticipado.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando menú…</p>}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          No se pudo cargar el menú. Inténtalo de nuevo.
        </p>
      )}

      {items && (
        <Carrito
          items={items}
          onConfirmar={confirmar}
          enviando={crearPedido.isPending}
          error={crearPedido.isError ? mensajeDeError(crearPedido.error) : null}
        />
      )}
    </div>
  );
}
