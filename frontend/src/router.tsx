import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Inicio } from './components/Inicio';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Usuarios } from './pages/admin/Usuarios';
import { Platillos } from './pages/admin/Platillos';
import { Menu as AdminMenu } from './pages/admin/Menu';
import { CajaLayout } from './pages/caja/CajaLayout';
import { Caja } from './pages/caja/Caja';
import { Entregas } from './pages/caja/Entregas';
import { CocinaLayout } from './pages/cocina/CocinaLayout';
import { Cocina } from './pages/cocina/Cocina';
import { ClientesLayout } from './pages/clientes/ClientesLayout';
import { Menu as MenuCliente } from './pages/clientes/Menu';
import { ArmarPedido } from './pages/clientes/Carrito';
import { Pago } from './pages/clientes/Pago';
import { MisPedidos } from './pages/clientes/MisPedidos';
import { PedidoDetalle } from './pages/clientes/PedidoDetalle';

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
    children: [
      { index: true, element: <Caja /> },
      { path: 'entregas', element: <Entregas /> },
    ],
  },
  {
    path: '/cocina',
    element: (
      <ProtectedRoute roles={['cocinero']}>
        <CocinaLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Cocina /> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ClientesLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Inicio /> },
      { path: 'menu', element: <MenuCliente /> },
      { path: 'pedido', element: <ArmarPedido /> },
      { path: 'pedido/pago', element: <Pago /> },
      {
        path: 'mis-pedidos',
        element: (
          <ProtectedRoute roles={['usuario']}>
            <MisPedidos />
          </ProtectedRoute>
        ),
      },
      {
        path: 'mis-pedidos/:id',
        element: (
          <ProtectedRoute roles={['usuario']}>
            <PedidoDetalle />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
