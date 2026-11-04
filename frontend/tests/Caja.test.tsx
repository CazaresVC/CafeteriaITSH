import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { Caja } from '../src/pages/caja/Caja';
import type { MenuItem } from '../src/lib/menu';
import type { Pedido } from '../src/lib/pedidos';

const mocks = vi.hoisted(() => ({
  useMenu: vi.fn(),
  usePedidos: vi.fn(),
  useCrearMostrador: vi.fn(),
  useCobrarPedido: vi.fn(),
  useCambiarEstado: vi.fn(),
}));

vi.mock('../src/lib/menu', () => ({ useMenu: mocks.useMenu }));
vi.mock('../src/lib/api', () => ({ mensajeDeError: vi.fn(() => 'boom') }));
vi.mock('../src/lib/pedidos', () => ({
  usePedidos: mocks.usePedidos,
  useCrearMostrador: mocks.useCrearMostrador,
  useCobrarPedido: mocks.useCobrarPedido,
  useCambiarEstado: mocks.useCambiarEstado,
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
  mocks.usePedidos.mockReset();
  mocks.useCrearMostrador.mockReset();
  mocks.useCobrarPedido.mockReset();
  mocks.useCambiarEstado.mockReset();

  mocks.useMenu.mockReturnValue({ data: [item], isLoading: false, isError: false });
  mocks.usePedidos.mockReturnValue({ data: [], isLoading: false, isError: false });
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
  mocks.useCambiarEstado.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    reset: vi.fn(),
  });
});

function mostrar() {
  return render(
    <MemoryRouter>
      <Caja />
    </MemoryRouter>,
  );
}

describe('Caja — captura y cobro de mostrador', () => {
  it('registra un pedido y lo cobra en efectivo', async () => {
    const user = userEvent.setup();
    mostrar();

    await user.click(screen.getByRole('button', { name: 'Nuevo pedido' }));
    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    await user.click(screen.getByRole('button', { name: 'Ver cobro' }));

    expect(screen.getByText('Cobro')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Registrar y cobrar' }));

    expect(crearMutate).toHaveBeenCalledWith(
      { items: [{ menu_dia_id: 1, cantidad: 1 }], cliente_nombre: undefined },
      expect.any(Object),
    );

    expect(await screen.findByText('ITS-20261013-0007')).toBeTruthy();
    expect(cobrarMutate).toHaveBeenCalledWith(7);
  });

  it('muestra el panel de inicio al entrar a caja', () => {
    mostrar();

    expect(screen.getByRole('button', { name: 'Nuevo pedido' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Registrar y cobrar' })).toBeNull();
  });
});
