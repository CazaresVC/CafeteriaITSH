import { LayoutModulo } from '../../components/LayoutModulo';
import { IconoCaja, IconoEntregas } from '../../components/iconos';

export function CajaLayout() {
  return (
    <LayoutModulo
      enlaces={[
        { to: '/caja', etiqueta: 'Mostrador', icono: <IconoCaja className="h-4 w-4" /> },
        { to: '/caja/entregas', etiqueta: 'Entregas', icono: <IconoEntregas className="h-4 w-4" /> },
      ]}
    />
  );
}
