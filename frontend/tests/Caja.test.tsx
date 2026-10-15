import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Caja } from '../src/pages/caja/Caja';
import type { MenuItem } from '../src/lib/menu';
import type { Pedido } from '../src/lib/pedidos';

const mocks = vi.hoisted(() => ({
  useMenu: vi.fn(),
  useCrearMostrador: vi.fn(),
  useCobrarPedido: vi.fn(),
}));

vi.mock('../src/lib/menu', () => ({ useMenu: mocks.useMenu }));
vi.mock('../src/lib/api', () => ({ mensajeDeError: vi.fn(() => 'boom') }));
vi.mock('../src/lib/pedidos', () => ({
  useCrearMostrador: mocks.useCrearMostrador,
  useCobrarPedido: mocks.useCobrarPedido,
}));

const item: MenuItem = {
  id: 1,
  fecha: '2026-10-13',
  platilloId: 3,
  nombre: 'Gordita de frijol',
  categoria: 'Comida',
  descripcion: null,
  precio: 30,
  disponible: true,
  especial: false,
};

const pedidoPendiente: Pedido = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'mostrador',
  estado: 'Pendiente',
  total: 30,
  lineas: [
    { id: 1, platilloId: 3, nombre: 'Gordita de frijol', cantidad: 1, precioUnitario: 30, subtotal: 30 },
  ],
  pago: null,
  creadoEn: '2026-10-13 10:00:00',
};

let crearMutate: ReturnType<typeof vi.fn>;
let cobrarMutate: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mocks.useMenu.mockReset();
  mocks.useCrearMostrador.mockReset();
  mocks.useCobrarPedido.mockReset();

  mocks.useMenu.mockReturnValue({ data: [item], isLoading: false, isError: false });
  crearMutate = vi.fn((_datos: unknown, opciones: { onSuccess: (p: Pedido) => void }) =>
    opciones.onSuccess(pedidoPendiente),
  );
  cobrarMutate = vi.fn();
  mocks.useCrearMostrador.mockReturnValue({
    mutate: crearMutate,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  });
  mocks.useCobrarPedido.mockReturnValue({
    mutate: cobrarMutate,
    isPending: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  });
});

describe('Caja — captura y cobro de mostrador', () => {
  it('registra un pedido y lo cobra en efectivo', async () => {
    const user = userEvent.setup();
    render(<Caja />);

    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    await user.click(screen.getByRole('button', { name: 'Registrar pedido' }));

    expect(crearMutate).toHaveBeenCalledWith(
      { items: [{ menu_dia_id: 1, cantidad: 1 }], cliente_nombre: undefined },
      expect.any(Object),
    );

    expect(screen.getByText('ITS-20261013-0007')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cobrar en efectivo' }));
    expect(cobrarMutate).toHaveBeenCalledWith(7);
  });

  it('muestra el formulario de captura al inicio', () => {
    render(<Caja />);

    expect(screen.getByRole('button', { name: 'Registrar pedido' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Cobrar en efectivo' })).toBeNull();
  });
});
