import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cocina } from '../src/pages/cocina/Cocina';
import type { Pedido } from '../src/lib/pedidos';

const mocks = vi.hoisted(() => ({
  usePedidos: vi.fn(),
  useCambiarEstado: vi.fn(),
}));

vi.mock('../src/lib/api', () => ({ mensajeDeError: vi.fn(() => 'boom') }));
vi.mock('../src/lib/pedidos', () => ({
  ESTADOS_ACTIVOS: ['Pendiente', 'Pagado', 'En preparación', 'Listo'],
  usePedidos: mocks.usePedidos,
  useCambiarEstado: mocks.useCambiarEstado,
}));

const pedidoPagado: Pedido = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'mostrador',
  estado: 'Pagado',
  total: 60,
  lineas: [
    { id: 1, platilloId: 3, nombre: 'Gordita de frijol', cantidad: 2, precioUnitario: 30, subtotal: 60 },
  ],
  pago: null,
  creadoEn: '2026-10-13 10:00:00',
};

let cambiarMutate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mocks.usePedidos.mockReset();
  mocks.useCambiarEstado.mockReset();

  mocks.usePedidos.mockReturnValue({ data: [pedidoPagado], isLoading: false, isError: false });
  cambiarMutate = vi.fn();
  mocks.useCambiarEstado.mockReturnValue({ mutate: cambiarMutate, isPending: false, isError: false });
});

describe('Cocina — tablero de pedidos', () => {
  it('muestra los pedidos activos con sus productos y cantidades', () => {
    render(<Cocina />);

    expect(screen.getByText('ITS-20261013-0007')).toBeTruthy();
    expect(screen.getByText('2 × Gordita de frijol')).toBeTruthy();
    expect(screen.getByTestId('espera-7')).toBeTruthy();
  });

  it('avanza un pedido Pagado a En preparación', async () => {
    const user = userEvent.setup();
    render(<Cocina />);

    await user.click(screen.getByRole('button', { name: 'Iniciar preparación' }));

    expect(cambiarMutate).toHaveBeenCalledWith(
      { id: 7, estado: 'En preparación' },
      expect.any(Object),
    );
  });

  it('muestra un estado vacío cuando no hay pedidos en la fila', () => {
    mocks.usePedidos.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<Cocina />);

    expect(screen.getByText(/No hay pedidos en la fila por ahora/)).toBeTruthy();
  });
});
