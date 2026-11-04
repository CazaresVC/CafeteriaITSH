import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../src/components/ui/confirm-dialog';

describe('ConfirmDialog — accesibilidad y acciones', () => {
  it('expone un diálogo modal con título y mensaje', () => {
    render(
      <ConfirmDialog
        abierto
        titulo="Quitar platillo"
        mensaje="¿Deseas quitar este platillo del menú?"
        onConfirmar={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAccessibleName('Quitar platillo');
    expect(dialogo).toHaveAccessibleDescription('¿Deseas quitar este platillo del menú?');
  });

  it('enfoca cancelar al abrir y cierra con Escape', async () => {
    const onCancelar = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        abierto
        titulo="Cancelar pedido"
        mensaje="Esta acción no se puede deshacer."
        onConfirmar={vi.fn()}
        onCancelar={onCancelar}
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('confirma con el botón principal', async () => {
    const onConfirmar = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        abierto
        titulo="Quitar platillo"
        mensaje="¿Deseas quitar este platillo del menú?"
        textoConfirmar="Quitar"
        variante="danger"
        onConfirmar={onConfirmar}
        onCancelar={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });
});
