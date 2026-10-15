import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PedidoMostrador } from '../src/components/caja/PedidoMostrador';
import type { MenuItem } from '../src/lib/menu';

const disponible: MenuItem = {
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

const agotado: MenuItem = {
  id: 2,
  fecha: '2026-10-13',
  platilloId: 5,
  nombre: 'Café de olla',
  categoria: 'Bebida',
  descripcion: null,
  precio: 20,
  disponible: false,
  especial: false,
};

describe('PedidoMostrador — registrar pedido de caja', () => {
  it('selecciona items, acumula el total y envía el menú_dia_id', async () => {
    const onRegistrar = vi.fn();
    const user = userEvent.setup();
    render(<PedidoMostrador items={[disponible, agotado]} onRegistrar={onRegistrar} />);

    expect(screen.getByTestId('total-mostrador').textContent).toBe('$0.00');
    expect(screen.queryByText('Café de olla')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    expect(screen.getByTestId('cantidad-mostrador-1').textContent).toBe('2');
    expect(screen.getByTestId('total-mostrador').textContent).toBe('$60.00');

    await user.type(screen.getByLabelText('Cliente (opcional)'), 'Juan');
    await user.click(screen.getByRole('button', { name: 'Registrar pedido' }));

    expect(onRegistrar).toHaveBeenCalledWith({
      items: [{ menu_dia_id: 1, cantidad: 2 }],
      cliente_nombre: 'Juan',
    });
  });

  it('deshabilita registrar mientras no hay selección', () => {
    render(<PedidoMostrador items={[disponible]} onRegistrar={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Registrar pedido' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('muestra un estado vacío cuando no hay platillos disponibles', () => {
    render(<PedidoMostrador items={[agotado]} onRegistrar={vi.fn()} />);

    expect(screen.getByText(/No hay platillos disponibles/)).toBeTruthy();
  });
});
