import { LayoutModulo } from '../../components/LayoutModulo';

export function ClientesLayout() {
  return (
    <LayoutModulo
      enlaces={[
        { to: '/menu', etiqueta: 'Menú' },
        { to: '/pedido', etiqueta: 'Pedido' },
      ]}
    />
  );
}
