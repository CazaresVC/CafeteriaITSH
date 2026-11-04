import { useLocation } from 'react-router-dom';
import { LayoutModulo } from '../../components/LayoutModulo';
import { NotificacionBadge } from '../../components/NotificacionBadge';
import { useAuth } from '../../lib/auth';
import { useMisPedidos } from '../../lib/pedidos';
import { IconoEntregas, IconoMenu } from '../../components/iconos';

export function ClientesLayout() {
  const { usuario } = useAuth();
  const ubicacion = useLocation();
  const { data } = useMisPedidos();
  const listos =
    usuario?.rol === 'usuario'
      ? (data ?? []).filter((pedido) => pedido.estado === 'Listo').length
      : 0;

  const enlaces = [
    {
      to: '/menu',
      etiqueta: 'Menú',
      icono: <IconoMenu className="h-4 w-4" />,
      end: true,
    },
    {
      to: '/mis-pedidos',
      etiqueta: 'Mis pedidos',
      icono: <IconoEntregas className="h-4 w-4" />,
      contador: listos,
    },
  ];

  const enFlujoPedido = ubicacion.pathname.startsWith('/pedido');

  return (
    <LayoutModulo
      enlaces={enlaces}
      acciones={<NotificacionBadge />}
      barraInferior={
        enFlujoPedido
          ? []
          : [
              {
                to: '/menu',
                etiqueta: 'Menú',
                icono: <IconoMenu className="h-5 w-5" />,
                end: true,
              },
              {
                to: '/mis-pedidos',
                etiqueta: 'Mis pedidos',
                icono: <IconoEntregas className="h-5 w-5" />,
                contador: listos,
              },
            ]
      }
    />
  );
}
