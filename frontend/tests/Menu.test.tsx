import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Menu } from '../src/pages/clientes/Menu';
import type { MenuItem } from '../src/lib/menu';

const { mockUseMenu } = vi.hoisted(() => ({ mockUseMenu: vi.fn() }));

vi.mock('../src/lib/menu', () => ({
  useMenu: mockUseMenu,
}));

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
  especial: true,
};

function mostrar(items: MenuItem[]) {
  mockUseMenu.mockReturnValue({ data: items, isLoading: false, isError: false });
  return render(<Menu />);
}

describe('Consulta del menú del día (cliente)', () => {
  beforeEach(() => {
    mockUseMenu.mockReset();
  });

  it('muestra platillos con precio y especiales', () => {
    mostrar([disponible, agotado]);

    expect(screen.getByText('Gordita de frijol')).toBeTruthy();
    expect(screen.getByText('$30.00')).toBeTruthy();
    expect(screen.getByText('Especial')).toBeTruthy();
  });

  it('identifica los platillos no disponibles como no seleccionables', () => {
    mostrar([agotado]);

    const aviso = screen.getByText('No disponible');
    const tarjeta = aviso.closest('li');
    expect(tarjeta?.getAttribute('aria-disabled')).toBe('true');
  });

  it('muestra un estado vacío cuando no hay menú publicado', () => {
    mostrar([]);

    expect(screen.getByText(/Aún no hay platillos publicados/)).toBeTruthy();
  });
});
