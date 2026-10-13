import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import type { Usuario } from '../src/lib/roles';

const { mockUseAuth } = vi.hoisted(() => ({ mockUseAuth: vi.fn() }));

vi.mock('../src/lib/auth', () => ({
  useAuth: mockUseAuth,
}));

function sesion(usuario: Usuario | null, cargando = false) {
  mockUseAuth.mockReturnValue({
    usuario,
    cargando,
    refrescar: vi.fn(),
    cerrarSesion: vi.fn(),
  });
}

const administrador: Usuario = {
  id: 1,
  nombre: 'Admin',
  correo: 'admin@cafeitsh.local',
  rol: 'administrador',
  activo: true,
};

const cliente: Usuario = {
  id: 2,
  nombre: 'Alumno',
  correo: 'alumno@cafeitsh.local',
  rol: 'usuario',
  activo: true,
};

function renderizarRutaProtegida(ruta = '/admin') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['administrador']}>
              <p>Contenido admin</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('redirige al login cuando no hay sesión', async () => {
    sesion(null);
    renderizarRutaProtegida();
    expect(await screen.findByText('Pantalla de login')).toBeTruthy();
  });

  it('muestra un aviso cuando el rol no está autorizado', () => {
    sesion(cliente);
    renderizarRutaProtegida();
    expect(screen.getByRole('alert').textContent).toContain('Acceso denegado');
  });

  it('renderiza el contenido cuando el rol está autorizado', () => {
    sesion(administrador);
    renderizarRutaProtegida();
    expect(screen.getByText('Contenido admin')).toBeTruthy();
  });

  it('muestra el estado de carga mientras se resuelve la sesión', () => {
    sesion(null, true);
    renderizarRutaProtegida();
    expect(screen.getByText('Cargando…')).toBeTruthy();
  });
});
