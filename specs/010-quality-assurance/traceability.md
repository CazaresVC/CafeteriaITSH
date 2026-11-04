# Trazabilidad: requisitos → pruebas / validación

**Spec fuente**: `specs/001-advance-order-system/spec.md`
**Sprint de QA**: `specs/010-quality-assurance/`
**Fecha**: 2026-10-31

## Método

- **Unitaria backend**: Vitest + `supertest` con `../src/config/db` mockeado.
- **Unitaria frontend**: Vitest + Testing Library + jsdom.
- **Integración**: Vitest + `supertest` + MySQL 8 real (`backend/tests/integration/`).
- **Manual**: quickstart del sprint 007, checklist de accesibilidad y humo de rendimiento.
- **Revisión de código**: para requisitos no observables desde una prueba (p. ej. no almacenar
  datos de tarjeta).

Estados: `Auto` = prueba automatizada; `Integración` = suite MySQL; `Manual` = evidencia
registrada; `Código` = revisión de implementación.

## Requisitos funcionales (FR)

| FR | Evidencia principal | Tipo |
|---|---|---|
| FR-001 Registro e inicio de sesión | `backend/tests/auth.test.ts`, `flujo.integration.test.ts` | Auto + Integración |
| FR-002 Un rol por usuario | `backend/tests/auth.test.ts`, `usuarios.test.ts` | Auto |
| FR-003 Acceso restringido por rol | `backend/tests/permisos.test.ts`, `frontend/tests/ProtectedRoute.test.tsx` | Auto |
| FR-004 Sesión y rol por módulo | `backend/tests/permisos.test.ts`, `ProtectedRoute.test.tsx` | Auto |
| FR-005 Admin gestiona operativos | `backend/tests/usuarios.test.ts` | Auto |
| FR-006 Contraseñas seguras | `backend/tests/auth.test.ts` + revisión `auth.service.ts` | Auto + Código |
| FR-007 Crear/modificar menú diario | `backend/tests/menu.test.ts` | Auto |
| FR-008 CRUD de platillos | `backend/tests/platillos.test.ts` | Auto |
| FR-009 Asignar/modificar precios | `backend/tests/menu.test.ts` | Auto |
| FR-010 Especiales del día | `backend/tests/menu.test.ts` | Auto |
| FR-011 Marcar no disponible | `backend/tests/menu.test.ts` | Auto |
| FR-012 No seleccionable si no disponible | `backend/tests/menu.test.ts`, `frontend/tests/Menu.test.tsx` | Auto |
| FR-013 Consultar menú del día | `backend/tests/menu.test.ts`, `Menu.test.tsx` | Auto |
| FR-014 Cambios inmediatos | `backend/tests/menu.test.ts`, `flujo.integration.test.ts` | Auto + Integración |
| FR-015 Seleccionar platillos/cantidades | `backend/tests/pedidos.test.ts`, `Carrito.test.tsx` | Auto |
| FR-016 Total antes de confirmar | `backend/tests/unit/totales.test.ts`, `Carrito.test.tsx` | Auto |
| FR-017 Mínimo 10 minutos | `backend/tests/pedidos.test.ts` (fuera de ventana 422) | Auto |
| FR-018 Impedir no disponibles en pedido | `backend/tests/pedidos.test.ts`, `mostrador.test.ts` | Auto |
| FR-019 Estado siempre presente | `backend/tests/estados.test.ts`, `transiciones.test.ts` | Auto |
| FR-020 Estados válidos | `backend/tests/estados.test.ts` | Auto |
| FR-021 Transiciones permitidas | `backend/tests/estados.test.ts`, `transiciones.test.ts` | Auto |
| FR-022 Impedir saltos y estados terminales | `backend/tests/estados.test.ts`, `transiciones.test.ts` | Auto |
| FR-023 Anticipados y mostrador simultáneos | `backend/tests/mostrador.test.ts`, `cocina.test.ts` | Auto |
| FR-024 Captura rápida en mostrador | `backend/tests/mostrador.test.ts`, `Caja.test.tsx`, `PedidoMostrador.test.tsx` | Auto |
| FR-025 Cobro de mostrador | `backend/tests/mostrador.test.ts`, `Caja.test.tsx` | Auto |
| FR-026 Listar pedidos propios | `backend/tests/pedidos.mios.test.ts`, `MisPedidos.test.tsx` | Auto |
| FR-027 Detalle de pedido | `backend/tests/pedidos.test.ts`, `MisPedidos.test.tsx` | Auto |
| FR-028 Pago en línea | `backend/tests/pago.test.ts` | Auto |
| FR-029 No almacenar datos de tarjeta | `backend/tests/pago.test.ts` + revisión `pago.service.ts` | Auto + Código |
| FR-030 Pagado solo con confirmación | `backend/tests/pago.test.ts`, `estados.test.ts` | Auto |
| FR-031 Cocina ve pedidos entrantes | `backend/tests/cocina.test.ts`, `Cocina.test.tsx` | Auto |
| FR-032 Productos y cantidades en cocina | `backend/tests/cocina.test.ts`, `Cocina.test.tsx` | Auto |
| FR-033 Orden de preparación | `backend/tests/cocina.test.ts` (orden por llegada) | Auto |
| FR-034 Cocina cambia a En preparación/Listo | `backend/tests/cocina.test.ts`, `PedidoCard.test.tsx` | Auto |
| FR-035 Actualización sin recarga manual | Revisión de `usePedidos` (`refetchInterval`) + `Docs/qa/accesibilidad.md` | Código + Manual |
| FR-036 Notificar al pasar a Listo | `backend/tests/notificaciones.test.ts`, `flujo.completo.test.ts` | Auto |
| FR-037 Notificaciones separadas de pedidos | `backend/tests/notificaciones.test.ts` + revisión `eventosPedido.ts` | Auto + Código |
| FR-038 Validar antes de procesar | `auth.test.ts`, `menu.test.ts`, `pedidos.test.ts`, `mostrador.test.ts` | Auto |
| FR-039 Errores claros sin trazas | `auth.test.ts` (401 genérico) + revisión `errorHandler.ts` | Auto + Código |
| FR-040 Secretos en variables de entorno | `backend/tests/setup.ts` + revisión `env.ts` + `npm audit` | Código + CI |

## Criterios de éxito (SC)

| SC | Evidencia | Tipo |
|---|---|---|
| SC-001 Flujo completo < 3 min | `flujo.integration.test.ts` + quickstart 007 | Integración + Manual |
| SC-002 100 % con ≥ 10 min y rechazo del resto | `pedidos.test.ts` + `flujo.integration.test.ts` | Auto + Integración |
| SC-003 Reducción ≥ 50 % de espera en caja | Demostración con la patrocinadora (`Docs/qa/accesibilidad.md`) | Manual |
| SC-004 Cero pedidos inválidos | `pedidos.test.ts`, `menu.test.ts`, `mostrador.test.ts` | Auto |
| SC-005 100 % de Listo notificado | `notificaciones.test.ts` + `flujo.integration.test.ts` | Auto + Integración |
| SC-006 Anticipados y mostrador simultáneos | `mostrador.test.ts`, `cocina.test.ts` + demo | Auto + Manual |
| SC-007 100 % de accesos sin rol bloqueados | `permisos.test.ts`, `ProtectedRoute.test.tsx` | Auto |
| SC-008 ≥ 90 % de éxito al primer intento | Quickstart 007 + demo | Manual |
| SC-009 ≤ 2 interacciones para avanzar | `PedidoCard.test.tsx`, `Cocina.test.tsx` | Auto |

## Límites conocidos

- **Sin cobertura automática**: no se instala `@vitest/coverage-v8` (§22). La matriz sustituye la
  métrica y el inventario registra el conteo.
- **Sin E2E de navegador**: no se instala Playwright; la UI se cubre con Testing Library y el
  quickstart manual.
- **Sin prueba de carga**: el script de humo mide p50/p95 en un entorno local, no concurrencia.
- **Sin lint de backend**: no existe script `lint`; se usan `typecheck` y `build`.
- **MySQL no disponible localmente**: la suite de integración se ejecuta en CI o con una base
  local preparada según `quickstart.md`.
- **FR-035 y SC-003/SC-008** dependen de validación manual registrada; no se automatizan en este
  sprint.

## Defectos y evidencia

Los hallazgos se registran en `Docs/qa/bitacora-defectos.md`; los resultados manuales en
`Docs/qa/accesibilidad.md` y en el PR correspondiente.
