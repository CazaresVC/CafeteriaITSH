import { LayoutModulo } from '../../components/LayoutModulo';
import { usePedidos } from '../../lib/pedidos';
import {
  IconoCaja,
  IconoEntregas,
  IconoInicio,
} from '../../components/iconos';

export function CajaLayout() {
  const { data } = usePedidos({ estados: ['Listo'], refetchInterval: 5000 });
  const pendientes = data?.length ?? 0;

  return (
    <LayoutModulo
      enlaces={[
        {
          to: '/caja',
          etiqueta: 'Inicio',
          icono: <IconoInicio className="h-4 w-4" />,
          end: true,
          query: {},
        },
        {
          to: '/caja',
          etiqueta: 'Capturar pedido',
          icono: <IconoCaja className="h-4 w-4" />,
          query: { paso: 'captura' },
        },
        {
          to: '/caja/entregas',
          etiqueta: 'Pedidos listos',
          icono: <IconoEntregas className="h-4 w-4" />,
          contador: pendientes,
        },
      ]}
      barraInferior={[
        {
          to: '/caja',
          etiqueta: 'Caja',
          icono: <IconoCaja className="h-5 w-5" />,
          end: true,
          query: {},
        },
        {
          to: '/caja/entregas',
          etiqueta: 'Entregas',
          icono: <IconoEntregas className="h-5 w-5" />,
          contador: pendientes,
        },
      ]}
    />
  );
}
