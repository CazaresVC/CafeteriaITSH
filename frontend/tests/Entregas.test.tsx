import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Entregas } from '../src/pages/caja/Entregas';
import type { Pedido } from '../src/lib/pedidos';

const mocks = vi.hoisted(() => ({
  usePedidos: vi.fn(),
  useCambiarEstado: vi.fn(),
}));

vi.mock('../src/lib/api', () => ({ mensajeDeError: vi.fn(() => 'boom') }));
vi.mock('../src/lib/pedidos', () => ({
  usePedidos: mocks.usePedidos,
  useCambiarEstado: mocks.useCambiarEstado,
}));

const pedidoListo: Pedido = {
  id: 12,
  numero: 'ITS-20261014-0012',
  tipo: 'mostrador',
  estado: 'Listo',
  total: 45,
  clienteNombre: 'Marta',
  lineas: [
    { id: 1, platilloId: 3, nombre: 'Gordita de frijol', cantidad: 1, precioUnitario: 15, subtotal: 15 },
    { id: 2, platilloId: 5, nombre: 'Café americano', cantidad: 2, precioUnitario: 15, subtotal: 30 },
  ],
  pago: null,
  creadoEn: '2026-10-14 09:30:00',
};

let cambiarMutate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mocks.usePedidos.mockReset();
  mocks.useCambiarEstado.mockReset();

  mocks.usePedidos.mockReturnValue({ data: [pedidoListo], isLoading: false, isError: false });
  cambiarMutate = vi.fn();
  mocks.useCambiarEstado.mockReturnValue({ mutate: cambiarMutate, isPending: false });
});

describe('Entregas — pedidos listos de caja', () => {
  it('lista los pedidos listos con folio y cliente', () => {
    render(<Entregas />);

    expect(screen.getByText('ITS-20261014-0012')).toBeTruthy();
    expect(screen.getByText(/Marta/)).toBeTruthy();
    expect(screen.getByText('1 pendiente(s)')).toBeTruthy();
  });

  it('marca un pedido como entregado', async () => {
    const user = userEvent.setup();
    render(<Entregas />);

    await user.click(screen.getByRole('button', { name: 'Entregar' }));

    expect(cambiarMutate).toHaveBeenCalledWith(
      { id: 12, estado: 'Entregado' },
      expect.any(Object),
    );
  });

  it('muestra el estado vacío cuando no hay pedidos listos', () => {
    mocks.usePedidos.mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<Entregas />);

    expect(screen.getByText('¡Todo está al día!')).toBeTruthy();
  });
});
