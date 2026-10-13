import { LayoutModulo } from '../../components/LayoutModulo';

export function AdminLayout() {
  return (
    <LayoutModulo
      enlaces={[
        { to: '/admin/usuarios', etiqueta: 'Usuarios' },
        { to: '/admin/platillos', etiqueta: 'Platillos' },
        { to: '/admin/menu', etiqueta: 'Menú' },
      ]}
    />
  );
}
