# Inventario de pruebas

**Fecha**: 2026-10-31
**Sprint**: 010-quality-assurance
**Entorno de ejecución**: Windows, Node.js 22, Vitest.

## Resumen

| Nivel | Archivos | Pruebas | Estado |
|---|---:|---:|---|
| Backend unitario (mocks) | 15 | 114 | Ejecutado: 114/114 en verde |
| Backend integración (MySQL 8) | 3 | 5 | Escrito; ejecución local bloqueada por credenciales de MySQL |
| Frontend (jsdom) | 9 | 29 | Ejecutado: 29/29 en verde |
| **Total** | **27** | **148** | — |

## Backend unitario

| Archivo | Pruebas | Cobertura funcional |
|---|---:|---|
| `backend/tests/auth.test.ts` | 13 | Login, registro, sesión, bloqueo por intentos |
| `backend/tests/usuarios.test.ts` | 8 | Gestión de operativos por admin |
| `backend/tests/platillos.test.ts` | 8 | CRUD de platillos |
| `backend/tests/menu.test.ts` | 16 | Menú del día, precios, disponibilidad, republicar |
| `backend/tests/pedidos.test.ts` | 10 | Pedido anticipado, ventana, totales, propiedad |
| `backend/tests/pedidos.mios.test.ts` | 5 | Listado y detalle del cliente |
| `backend/tests/pago.test.ts` | 6 | Pago en línea, idempotencia, rechazo |
| `backend/tests/mostrador.test.ts` | 9 | Captura y cobro de mostrador |
| `backend/tests/cocina.test.ts` | 8 | Fila de cocina, orden y transiciones |
| `backend/tests/estados.test.ts` | 4 | Máquina de estados y pago |
| `backend/tests/transiciones.test.ts` | 7 | Entrega, cancelación y transiciones |
| `backend/tests/notificaciones.test.ts` | 8 | Aviso, reintento, propiedad |
| `backend/tests/permisos.test.ts` | 7 | Permisos por rol |
| `backend/tests/flujo.completo.test.ts` | 1 | Flujo completo con mocks |
| `backend/tests/unit/totales.test.ts` | 4 | Cálculo de totales |

## Backend integración

| Archivo | Pruebas | Cobertura |
|---|---:|---|
| `backend/tests/integration/migraciones.integration.test.ts` | 2 | Idempotencia y esquema base |
| `backend/tests/integration/flujo.integration.test.ts` | 1 | Menú → pedido → pago → cocina → listo → aviso → entrega |
| `backend/tests/integration/permisos.integration.test.ts` | 2 | Pedido ajeno = 404 y roles |

## Frontend

| Archivo | Pruebas | Cobertura |
|---|---:|---|
| `frontend/tests/Caja.test.tsx` | 2 | Captura y cobro de mostrador |
| `frontend/tests/Carrito.test.tsx` | 3 | Selección, cantidades y total |
| `frontend/tests/Cocina.test.tsx` | 3 | Tablero y avance de pedidos |
| `frontend/tests/Entregas.test.tsx` | 3 | Pedidos listos y entrega |
| `frontend/tests/Menu.test.tsx` | 3 | Menú, no disponibles y vacío |
| `frontend/tests/MisPedidos.test.tsx` | 3 | Estados y detalle |
| `frontend/tests/PedidoCard.test.tsx` | 5 | Acciones por estado |
| `frontend/tests/PedidoMostrador.test.tsx` | 3 | Selección y envío |
| `frontend/tests/ProtectedRoute.test.tsx` | 4 | Sesión, rol y carga |

## Cómo reproducir

```powershell
cd backend
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:integration   # requiere MySQL 8 y DATABASE_URL_TEST

cd ..\frontend
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Límites

- No hay cobertura automática ni E2E de navegador por la restricción de no añadir
  dependencias (§22).
- La integración local requiere una base `cafe_itsh_test` y un usuario con permisos; en CI se
  aprovisiona con el servicio `mysql:8.0`.
- La aceptación visual se registra en `Docs/qa/accesibilidad.md`.
