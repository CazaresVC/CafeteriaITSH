import { useNavigate } from 'react-router-dom';
import { useMenu } from '../../lib/menu';
import { useCarrito } from '../../lib/carrito';
import { useCrearPedido, type LineaPedidoInput } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { Carrito } from '../../components/clientes/Carrito';
import { PageHeader } from '../../components/ui/page-header';
import { IconoCaja } from '../../components/iconos';

export function ArmarPedido() {
  const { data: items, isLoading, isError } = useMenu();
  const { limpiar } = useCarrito();
  const crearPedido = useCrearPedido();
  const navegar = useNavigate();

  async function confirmar(lineas: LineaPedidoInput[]) {
    const pedido = await crearPedido.mutateAsync(lineas);
    limpiar();
    navegar('/pedido/pago', { state: { pedidoId: pedido.id } });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icono={<IconoCaja className="h-5 w-5" />}
        titulo="Confirma tu pedido"
        descripcion="Revisa los platillos y cantidades antes de continuar al pago."
      />

      {isLoading && (
        <p className="text-sm text-on-surface-variant" role="status">
          Cargando menú…
        </p>
      )}

      {isError && (
        <p className="text-sm text-error" role="alert">
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
