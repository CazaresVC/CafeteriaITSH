import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MisPedidos } from '../src/pages/clientes/MisPedidos';
import { PedidoDetalle } from '../src/pages/clientes/PedidoDetalle';
import type { Pedido } from '../src/lib/pedidos';

const mocks = vi.hoisted(() => ({
  useMisPedidos: vi.fn(),
  usePedido: vi.fn(),
}));

vi.mock('../src/lib/pedidos', () => ({
  useMisPedidos: mocks.useMisPedidos,
  usePedido: mocks.usePedido,
}));

const pedido: Pedido = {
  id: 7,
  numero: 'ITS-20261013-0007',
  tipo: 'anticipado',
  estado: 'Listo',
  total: 60,
  lineas: [
    { id: 1, platilloId: 3, nombre: 'Gordita de frijol', cantidad: 2, precioUnitario: 30, subtotal: 60 },
  ],
  pago: null,
  creadoEn: '2026-10-13 10:00:00',
};

function mostrarLista() {
  return render(
    <MemoryRouter>
      <MisPedidos />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.useMisPedidos.mockReset();
  mocks.usePedido.mockReset();
});

describe('MisPedidos — seguimiento del cliente', () => {
  it('muestra los pedidos con su estado y total', () => {
    mocks.useMisPedidos.mockReturnValue({ data: [pedido], isLoading: false, isError: false });

    mostrarLista();

    expect(screen.getByText('ITS-20261013-0007')).toBeTruthy();
    expect(screen.getByText('Listo')).toBeTruthy();
    expect(screen.getByText('$60.00')).toBeTruthy();
  });

  it('muestra un estado vacío cuando no hay pedidos', () => {
    mocks.useMisPedidos.mockReturnValue({ data: [], isLoading: false, isError: false });

    mostrarLista();

    expect(screen.getByText(/Aún no tienes pedidos/)).toBeTruthy();
  });

  it('detalle: muestra platillos, cantidades y total', () => {
    mocks.usePedido.mockReturnValue({ data: pedido, isLoading: false, isError: false });

    render(
      <MemoryRouter initialEntries={['/mis-pedidos/7']}>
        <Routes>
          <Route path="/mis-pedidos/:id" element={<PedidoDetalle />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('2 × Gordita de frijol')).toBeTruthy();
    expect(screen.getByText('$30.00 c/u')).toBeTruthy();
    expect(screen.getAllByText('$60.00').length).toBeGreaterThan(0);
  });
});
