import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Usuarios } from './pages/admin/Usuarios';
import { Platillos } from './pages/admin/Platillos';
import { Menu as AdminMenu } from './pages/admin/Menu';
import { CajaLayout } from './pages/caja/CajaLayout';
import { CocinaLayout } from './pages/cocina/CocinaLayout';
import { ClientesLayout } from './pages/clientes/ClientesLayout';
import { Menu as MenuCliente } from './pages/clientes/Menu';
import { ArmarPedido } from './pages/clientes/Carrito';
import { Pago } from './pages/clientes/Pago';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/registro', element: <Registro /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['administrador']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/usuarios" replace /> },
      { path: 'usuarios', element: <Usuarios /> },
      { path: 'platillos', element: <Platillos /> },
      { path: 'menu', element: <AdminMenu /> },
    ],
  },
  {
    path: '/caja',
    element: (
      <ProtectedRoute roles={['cajero']}>
        <CajaLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cocina',
    element: (
      <ProtectedRoute roles={['cocinero']}>
        <CocinaLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ClientesLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/menu" replace /> },
      { path: 'menu', element: <MenuCliente /> },
      { path: 'pedido', element: <ArmarPedido /> },
      { path: 'pedido/pago', element: <Pago /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
