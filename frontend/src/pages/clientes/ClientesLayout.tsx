import { LayoutModulo } from '../../components/LayoutModulo';
import { NotificacionBadge } from '../../components/NotificacionBadge';
import { IconoCaja, IconoEntregas, IconoMenu } from '../../components/iconos';

export function ClientesLayout() {
  return (
    <LayoutModulo
      enlaces={[
        { to: '/menu', etiqueta: 'Menú', icono: <IconoMenu className="h-4 w-4" /> },
        { to: '/pedido', etiqueta: 'Pedido', icono: <IconoCaja className="h-4 w-4" /> },
        { to: '/mis-pedidos', etiqueta: 'Mis pedidos', icono: <IconoEntregas className="h-4 w-4" /> },
      ]}
      acciones={<NotificacionBadge />}
    />
  );
}
