import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PedidoCard } from '../src/components/cocina/PedidoCard';
import type { Pedido } from '../src/lib/pedidos';

function crearPedido(estado: string): Pedido {
  return {
    id: 7,
    numero: 'ITS-20261013-0007',
    tipo: 'mostrador',
    estado,
    total: 60,
    lineas: [
      {
        id: 1,
        platilloId: 3,
        nombre: 'Gordita de frijol',
        cantidad: 2,
        precioUnitario: 30,
        subtotal: 60,
      },
    ],
    pago: null,
    creadoEn: '2026-10-13 10:00:00',
    clienteNombre: 'Juan',
  };
}

describe('PedidoCard — avanzar pedidos en cocina', () => {
  it('muestra el folio, las líneas y el total', () => {
    render(<PedidoCard pedido={crearPedido('Pagado')} onCambiar={vi.fn()} />);

    expect(screen.getByText('ITS-20261013-0007')).toBeTruthy();
    expect(screen.getByText('2 × Gordita de frijol')).toBeTruthy();
    expect(screen.getAllByText('$60.00')).toHaveLength(2);
    expect(screen.getByText('Pagado')).toBeTruthy();
  });

  it('avanza Pagado → En preparación', async () => {
    const onCambiar = vi.fn();
    const user = userEvent.setup();
    render(<PedidoCard pedido={crearPedido('Pagado')} onCambiar={onCambiar} />);

    await user.click(screen.getByRole('button', { name: 'Iniciar preparación' }));
    expect(onCambiar).toHaveBeenCalledWith('En preparación');
  });

  it('avanza En preparación → Listo y Listo → Entregado', async () => {
    const onCambiar = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <PedidoCard pedido={crearPedido('En preparación')} onCambiar={onCambiar} />,
    );

    await user.click(screen.getByRole('button', { name: 'Marcar listo' }));
    expect(onCambiar).toHaveBeenCalledWith('Listo');

    rerender(<PedidoCard pedido={crearPedido('Listo')} onCambiar={onCambiar} />);
    await user.click(screen.getByRole('button', { name: 'Marcar entregado' }));
    expect(onCambiar).toHaveBeenCalledWith('Entregado');
  });

  it('permite cancelar mientras el pedido no está cerrado', async () => {
    const onCambiar = vi.fn();
    const user = userEvent.setup();
    render(<PedidoCard pedido={crearPedido('Pagado')} onCambiar={onCambiar} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCambiar).toHaveBeenCalledWith('Cancelado');
  });

  it('no ofrece acciones para un pedido entregado', () => {
    render(<PedidoCard pedido={crearPedido('Entregado')} onCambiar={vi.fn()} />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
