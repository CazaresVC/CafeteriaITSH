import { LayoutModulo } from '../../components/LayoutModulo';
import { IconoCocina } from '../../components/iconos';

export function CocinaLayout() {
  return (
    <LayoutModulo
      enlaces={[{ to: '/cocina', etiqueta: 'Pedidos', icono: <IconoCocina className="h-4 w-4" /> }]}
    />
  );
}
