---
description: "Task list for Seguimiento, notificaciones y cierre (Sprint 5)"
---

# Tasks: Seguimiento, notificaciones y cierre (Sprint 5)

**Input**: Design documents from `/specs/006-order-tracking-notifications/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos (la constitución §VIII exige pruebas de la lógica crítica: estados, pagos y
permisos).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2 o US3

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización y ajustes de configuración del sprint

- [x] T001 Crear las carpetas del sprint (`backend/src/routes`, `backend/src/controllers`, `backend/src/services`, `frontend/src/pages/clientes`) según plan.md
- [x] T002 [P] Ajustar `backend/package.json` (sin dependencias nuevas; confirmar scripts `dev`, `build`, `test`, `migrate`, `typecheck`)
- [x] T003 [P] Añadir `NOTIFICATION_PROVIDER` y `NOTIFICATION_API_KEY` a `backend/.env.example` y documentar que `.env` no se versiona
- [x] T004 [P] Configurar Vitest del backend para la nueva carpeta `backend/tests/` y la cobertura de pruebas críticas en `backend/vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura que MUST completarse antes de cualquier historia

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [x] T005 [P] Implementar el emisor tipado de eventos de dominio en `backend/src/services/eventosPedido.ts` (`pedido.listo` con `{ pedidoId, usuarioId, numero, fecha }`)
- [x] T006 [P] Crear migración `database/migrations/003_notificaciones.sql` (`vista TINYINT(1) DEFAULT 0`, `idx_notificacion_pedido`, unicidad `uq_notificacion_pedido_tipo (pedido_id, tipo)`)
- [x] T007 [P] Definir tipos y schema `zod` de notificación/estado de pedido en `backend/src/services/notificaciones.service.ts`
- [x] T008 [P] Implementar el proveedor de canal en `backend/src/services/notificacion.provider.ts` (in-app mínimo; externo opcional si existe `NOTIFICATION_API_KEY`)
- [x] T009 Registrar en `backend/src/app.ts` el *listener* que conecta `pedido.listo` con el servicio de notificaciones (sin acoplar pedidos y notificaciones)
- [x] T010 [P] Crear `frontend/src/lib/pedidos.ts` y `frontend/src/lib/notificaciones.ts` con las claves de consulta de TanStack Query

**Checkpoint**: Infraestructura lista — las historias pueden comenzar

---

## Phase 3: User Story 1 - Consultar el estado de mis pedidos (Priority: P1) 🎯 MVP

**Goal**: El cliente ve la lista y el detalle de sus propios pedidos con el estado actual.

**Independent Test**: Un cliente con pedidos previos ve su lista con estado actualizado y el
detalle (platillos, cantidades y total); no ve pedidos de otros clientes.

### Tests for User Story 1 ⚠️

- [x] T011 [P] [US1] Test de integración de `GET /pedidos/mios` y `GET /pedidos/{id}` en `backend/tests/pedidos.mios.test.ts` (200 propio; 404 ajeno; 401 sin sesión)
- [x] T012 [P] [US1] Test de `MisPedidos` y detalle en `frontend/tests/MisPedidos.test.tsx` (renderiza lista, detalle y estado vacío)

### Implementation for User Story 1

- [x] T013 [P] [US1] Implementar `listarMios(usuarioId)` en `backend/src/services/pedidos.service.ts` (SQL parametrizado, `ORDER BY creado_en DESC`)
- [x] T014 [P] [US1] Implementar `detallePropio(pedidoId, usuarioId)` en `backend/src/services/pedidos.service.ts` (pedido + líneas; 404 si no es del usuario)
- [x] T015 [US1] Implementar `backend/src/controllers/pedidos.controller.ts` y `backend/src/routes/pedidos.routes.ts` (`GET /pedidos/mios`, `GET /pedidos/{id}`)
- [x] T016 [US1] Montar las rutas de pedidos en `backend/src/app.ts` con `requireAuth` y `requireRole('usuario')`
- [x] T017 [P] [US1] Implementar hooks de consulta en `frontend/src/lib/pedidos.ts` con `refetchInterval` (polling) y `refetchOnWindowFocus`
- [x] T018 [US1] Crear `frontend/src/pages/clientes/MisPedidos.tsx` (lista con estado actual, total y enlace al detalle)
- [x] T019 [US1] Crear `frontend/src/pages/clientes/PedidoDetalle.tsx` (platillos, cantidades, precio unitario, subtotal y total)
- [x] T020 [US1] Registrar la ruta `/mis-pedidos` (y su detalle) en `frontend/src/router.tsx` protegida con rol `usuario`

**Checkpoint**: US1 funcional y verificable de forma independiente

---

## Phase 4: User Story 2 - Recibir la notificación de pedido listo (Priority: P1)

**Goal**: Cuando un pedido pasa a "Listo", el cliente recibe un aviso; el fallo del canal no
corrompe el pedido.

**Independent Test**: Al pasar un pedido a "Listo" se genera una notificación consultable por
el cliente; un fallo del canal deja el pedido intacto y el aviso `'fallida'` para reintento.

### Tests for User Story 2 ⚠️

- [x] T021 [P] [US2] Test de integración "100 % de Listo generan notificación" en `backend/tests/notificaciones.test.ts` (transición → fila en `notificacion`)
- [x] T022 [P] [US2] Test de fallo del canal externo en `backend/tests/notificaciones.test.ts` (`estado_envio='fallida'`, `detalle_error`, pedido intacto)
- [x] T023 [P] [US2] Test de idempotencia de reintento en `backend/tests/notificaciones.test.ts` (no duplica `(pedido_id, tipo)`)

### Implementation for User Story 2

- [x] T024 [P] [US2] Implementar `emitirPedidoListo({ pedidoId, usuarioId, numero, fecha })` en `backend/src/services/notificaciones.service.ts` (insert con `ON DUPLICATE KEY UPDATE`, actualiza `estado_envio`)
- [x] T025 [P] [US2] Implementar el envío in-app y externo opcional en `backend/src/services/notificacion.provider.ts` (degradación si no hay `NOTIFICATION_API_KEY`)
- [x] T026 [US2] Emitir `pedido.listo` desde el servicio de transición de estado (Sprint 4) al confirmar "En preparación" → "Listo", tras cambiar el estado y envuelto en `try/catch`
- [x] T027 [US2] Implementar `reintentarFallidas()` en `backend/src/services/notificaciones.service.ts` (reintenta avisos `'fallida'` sin bloquear pedidos)
- [x] T028 [US2] Implementar `backend/src/controllers/notificaciones.controller.ts` y `backend/src/routes/notificaciones.routes.ts` (`GET /notificaciones/mias`, `PATCH /notificaciones/{id}/vista`) con `requireAuth` y verificación de propiedad
- [x] T029 [US2] Implementar hooks de notificaciones en `frontend/src/lib/notificaciones.ts` (listar y marcar como vista; `refetchInterval`)
- [x] T030 [US2] Crear `frontend/src/components/NotificacionBadge.tsx` e integrarlo en `frontend/src/pages/clientes/ClientesLayout.tsx`
- [x] T031 [US2] Integrar el *polling* de estado y avisos en `frontend/src/pages/clientes/MisPedidos.tsx` (estado actualizado sin recarga manual)

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Cierre y demostración del MVP (Priority: P2)

**Goal**: Pulido de interfaz, pruebas críticas en verde y demostración del flujo completo.

**Independent Test**: Se ejecuta el flujo completo (menú → selección → pedido → pago → cocina →
preparación → listo → notificación → recogida) con las pruebas críticas en verde.

### Tests for User Story 3 ⚠️

- [x] T032 [P] [US3] Test end-to-end del flujo completo con `supertest` en `backend/tests/flujo.completo.test.ts`
- [x] T033 [P] [US3] Test de permisos en `backend/tests/permisos.test.ts` (100 % de accesos a pedidos/avisos ajenos bloqueados; rutas por rol)
- [x] T034 [P] [US3] Test de regresión de estados y pagos en `backend/tests/estados.test.ts` (transiciones válidas/inválidas, pago confirmado/no confirmado)

### Implementation for User Story 3

- [x] T035 [P] [US3] Pulir la interfaz de `/mis-pedidos` y avisos según los tokens de `.stitch/DESIGN.md` en `frontend/src/pages/clientes/` y `frontend/src/components/ui/`
- [x] T036 [US3] Asegurar responsividad y accesibilidad táctil (≥ 44 px, alto contraste) en las pantallas de `frontend/src/pages/caja/` y `frontend/src/pages/cocina/`
- [x] T037 [P] [US3] Crear `database/migrations/005_seed_demo.sql` con datos de demostración para el flujo completo (sólo desarrollo)
- [x] T038 [US3] Redactar el guion de la demostración final en `Docs/demo-sprint5.md`
- [x] T039 [US3] Ejecutar el flujo completo end-to-end para la patrocinadora y registrar resultados

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias

- [x] T040 [P] Documentar los endpoints de seguimiento/notificaciones y las variables de notificación en `backend/README.md`
- [x] T041 [P] Revisar que `errorHandler` responda sin filtrar información interna en los nuevos endpoints
- [x] T042 Verificar `npm run typecheck` y `npm test` en verde (backend y frontend)
- [x] T043 [P] Revisar tamaños táctiles y contraste en caja y cocina contra los tokens de diseño
- [x] T044 Ejecutar los escenarios de `quickstart.md` y registrar resultados para la demo
- [x] T045 Confirmar la trazabilidad de FR-026, FR-027, FR-036 y FR-037 y de SC-001…SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **User Stories (Phases 3–5)**: dependen de Foundational; US1 es P1 (MVP); US2 es P1 y puede ir
  en paralelo con US1; US3 (P2) cierra el sprint
- **Polish (Phase 6)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: sin dependencias tras Foundational
- **US2 (P1)**: reutiliza el evento de dominio (T005/T009) pero es independiente en prueba
- **US3 (P2)**: integra US1 y US2; su prueba independiente es el flujo completo

### Within Each User Story

- Las pruebas MUST escribirse y fallar antes de la implementación
- Servicios antes de controladores/rutas; hooks antes de las páginas
- Núcleo antes de la integración; una historia completa antes de la siguiente prioridad

### Parallel Opportunities

- T002–T004 en paralelo; T005–T008 y T010 en paralelo
- Tests de cada historia en paralelo (T011/T012, T021/T022/T023, T032/T033/T034)
- Implementaciones [P] dentro de una historia (T013/T014, T017, T024/T025, T035/T037)

---

## Parallel Example: User Story 2

```bash
# Lanzar las pruebas de US2 juntas:
Task: "Test 100% de Listo → notificación en backend/tests/notificaciones.test.ts"
Task: "Test de fallo del canal sin corromper el pedido en backend/tests/notificaciones.test.ts"
Task: "Test de idempotencia de reintento en backend/tests/notificaciones.test.ts"

# Implementaciones independientes de US2:
Task: "emitirPedidoListo en backend/src/services/notificaciones.service.ts"
Task: "Proveedor de canal en backend/src/services/notificacion.provider.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3 (US1)
2. **STOP y VALIDAR**: lista y detalle propios, sin ver pedidos ajenos
3. Demo si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → demo (cliente ve sus pedidos)
3. US2 → validar → demo (notificación de "Listo", fallo tolerado)
4. US3 → pulido + pruebas críticas → demostración final del MVP
5. Cada historia añade valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias
- Etiqueta [Story] para trazabilidad con `spec.md`
- La notificación se dispara por evento de dominio y NUNCA dentro de la ruta crítica del pedido
- Un fallo del canal deja el pedido intacto y el aviso `'fallida'` para reintento
- El refresco es por *polling* (TanStack Query); sin WebSocket/SSE en el MVP
- Commit tras cada tarea o grupo lógico; no versionar `.env`

## Notas de implementación

- T006: la migración de notificaciones se creó como `database/migrations/004_notificaciones.sql`
  (no `003_`), porque `003_seed_usuarios.sql` ya existía. La demo quedó en
  `005_seed_demo.sql` (T037).
- La transición que dispara el evento es "En preparación" → "Listo" (Sprint 4); `cambiarEstado`
  espera a los suscriptores dentro de `try/catch`, de modo que un fallo de notificación nunca
  corrompe el pedido.
- La idempotencia del reintento se apoya en la unicidad `uq_notificacion_pedido_tipo (pedido_id, tipo)`.
- Ownership: `GET /pedidos/{id}` de un pedido ajeno responde 404 (no 403) para no revelar existencia
  (SC-004); se actualizó la prueba del Sprint 3.
