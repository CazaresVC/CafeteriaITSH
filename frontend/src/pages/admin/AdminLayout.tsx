import { LayoutModulo } from '../../components/LayoutModulo';
import {
  IconoInicio,
  IconoMenu,
  IconoPlatillos,
  IconoUsuarios,
} from '../../components/iconos';

export function AdminLayout() {
  return (
    <LayoutModulo
      enlaces={[
        {
          to: '/admin',
          etiqueta: 'Inicio',
          icono: <IconoInicio className="h-4 w-4" />,
          end: true,
          query: {},
        },
        {
          to: '/admin/usuarios',
          etiqueta: 'Usuarios',
          icono: <IconoUsuarios className="h-4 w-4" />,
        },
        {
          to: '/admin/platillos',
          etiqueta: 'Platillos',
          icono: <IconoPlatillos className="h-4 w-4" />,
        },
        { to: '/admin/menu', etiqueta: 'Menú', icono: <IconoMenu className="h-4 w-4" /> },
      ]}
    />
  );
}
