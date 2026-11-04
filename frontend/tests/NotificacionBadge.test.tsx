import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificacionBadge } from '../src/components/NotificacionBadge';

const mocks = vi.hoisted(() => ({
  useNotificaciones: vi.fn(),
  useMarcarVista: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('../src/lib/notificaciones', () => ({
  useNotificaciones: mocks.useNotificaciones,
  useMarcarVista: mocks.useMarcarVista,
}));

beforeEach(() => {
  mocks.mutate.mockReset();
  mocks.useNotificaciones.mockReset();
  mocks.useMarcarVista.mockReset();
  mocks.useMarcarVista.mockReturnValue({ mutate: mocks.mutate });
});

describe('NotificacionBadge — panel de avisos', () => {
  it('muestra el contador y abre el panel con sus avisos', async () => {
    mocks.useNotificaciones.mockReturnValue({
      data: [{ id: 4, tipo: 'pedido_listo', numero: 'ITS-20261013-0007', vista: false }],
    });
    const user = userEvent.setup();

    render(<NotificacionBadge />);

    const boton = screen.getByRole('button', { name: 'Notificaciones (1 sin leer)' });
    expect(screen.getByText('1')).toBeTruthy();

    await user.click(boton);
    expect(screen.getByRole('dialog', { name: 'Notificaciones' })).toBeTruthy();
    expect(screen.getByText('Tu pedido está listo para recoger')).toBeTruthy();
    expect(boton).toHaveAttribute('aria-expanded', 'true');
  });

  it('marca un aviso como visto al seleccionarlo', async () => {
    mocks.useNotificaciones.mockReturnValue({
      data: [{ id: 4, tipo: 'pedido_listo', numero: 'ITS-20261013-0007', vista: false }],
    });
    const user = userEvent.setup();

    render(<NotificacionBadge />);
    await user.click(screen.getByRole('button', { name: 'Notificaciones (1 sin leer)' }));
    await user.click(screen.getByRole('button', { name: /Tu pedido está listo para recoger/ }));

    expect(mocks.mutate).toHaveBeenCalledWith(4);
  });

  it('cierra con Escape y devuelve el foco al botón', async () => {
    mocks.useNotificaciones.mockReturnValue({
      data: [{ id: 4, tipo: 'pedido_listo', numero: 'ITS-20261013-0007', vista: false }],
    });
    const user = userEvent.setup();

    render(<NotificacionBadge />);
    const boton = screen.getByRole('button', { name: 'Notificaciones (1 sin leer)' });
    await user.click(boton);
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(boton).toHaveFocus();
  });
});
