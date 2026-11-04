import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Carrito } from '../src/components/clientes/Carrito';
import { CarritoProvider } from '../src/lib/carrito';
import type { MenuItem } from '../src/lib/menu';

const disponible: MenuItem = {
  id: 1,
  fecha: '2026-10-13',
  platilloId: 3,
  nombre: 'Gordita de frijol',
  categoria: 'Comida',
  descripcion: 'Con frijoles refritos',
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

function mostrar(items: MenuItem[], onConfirmar = vi.fn()) {
  return render(
    <CarritoProvider>
      <Carrito items={items} onConfirmar={onConfirmar} />
    </CarritoProvider>,
  );
}

describe('Carrito — armar un pedido anticipado', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('selecciona platillos, maneja cantidades y muestra el total', async () => {
    const onConfirmar = vi.fn();
    const user = userEvent.setup();
    mostrar([disponible, agotado], onConfirmar);

    expect(screen.getByTestId('total').textContent).toBe('$0.00');
    expect(screen.queryByText('Café de olla')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    expect(screen.getByTestId('cantidad-3').textContent).toBe('1');
    expect(screen.getByTestId('total').textContent).toBe('$30.00');

    await user.click(screen.getByRole('button', { name: 'Agregar Gordita de frijol' }));
    expect(screen.getByTestId('cantidad-3').textContent).toBe('2');
    expect(screen.getByTestId('total').textContent).toBe('$60.00');

    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));
    expect(onConfirmar).toHaveBeenCalledWith([{ platilloId: 3, cantidad: 2 }]);
  });

  it('deshabilita confirmar mientras no hay selección', () => {
    mostrar([disponible]);

    expect(screen.getByRole('button', { name: 'Confirmar pedido' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('muestra un estado vacío cuando no hay platillos disponibles', () => {
    mostrar([agotado]);

    expect(screen.getByText(/No hay platillos disponibles/)).toBeTruthy();
  });
});
