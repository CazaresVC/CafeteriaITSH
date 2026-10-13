---
description: "Task list for Pedido anticipado y pago (Sprint 3)"
---

# Tasks: Pedido anticipado y pago (Sprint 3)

**Input**: Design documents from `/specs/004-advance-orders-payment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos (la constitución §20 exige pruebas de la lógica crítica: creación y
validación de pedidos, cálculo de totales, cambios de estado, idempotencia y control de
permisos por rol).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 o US2
- Incluir rutas de archivo exactas en las descripciones

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`
- **Migraciones**: `database/migrations/` (ya existentes; esta feature no crea migraciones)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la infraestructura del Sprint 1 reutilizada por esta feature

- [x] T001 Verificar la estructura existente en `backend/src/{config,db,middlewares,routes,controllers,services,utils}` y `frontend/src/{lib,components/ui,pages/clientes}` y los scripts (`dev`, `test`, `typecheck`, `migrate`) según plan.md
- [x] T002 [P] Confirmar dependencias existentes (`express`, `mysql2`, `zod`, `jsonwebtoken`, `@tanstack/react-query`, `axios`, Tailwind, shadcn/ui) en `backend/package.json` y `frontend/package.json`; no agregar dependencias nuevas (constitución §8/§20)
- [x] T003 [P] Revisar `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql` y confirmar tablas (`pedido`, `pedido_detalle`, `pago`, `estado_pedido`, `transicion_estado`, `pedido_estado_historial`) y la transición `Pendiente → Pagado`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida por todas las historias (ventana, folio, pago, estado, validación)

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [x] T004 [P] Implementar generación de folio en `backend/src/utils/numero.ts` (valor único para `pedido.numero`)
- [x] T005 [P] Implementar esquemas zod en `backend/src/utils/schemas/pedidos.schema.ts` (`PedidoInput`, `PagoInput`) validando al menos una línea y `cantidad > 0`
- [x] T006 [P] Implementar la validación de la ventana de pedido anticipado en `backend/src/services/ventana.service.ts` (`dentroDeVentana(ahora)`) leyendo `PEDIDO_VENTANA_INICIO`/`PEDIDO_VENTANA_FIN`
- [x] T007 [P] Implementar la pasarela abstracta en `backend/src/utils/payment/gateway.ts` (`cobrar(monto, token)` con implementación simulada para el MVP)
- [x] T008 Implementar la máquina de estados en `backend/src/services/estado.service.ts`: `validarTransicion(origenId, destinoId)` contra `transicion_estado` y `registrarCambio(conn, pedidoId, desdeId, haciaId, usuarioId)` que actualiza `pedido.estado_id` e inserta en `pedido_estado_historial` dentro de una transacción
- [x] T009 [P] Implementar hooks de TanStack Query en `frontend/src/lib/pedidos.ts` (`useCrearPedido`, `usePagarPedido`, `usePedido`)
- [x] T010 Montar `pedidos.routes.ts` en `backend/src/app.ts` con `requireAuth` + `requireRole('usuario')`

**Checkpoint**: Infraestructura lista — las historias pueden comenzar

---

## Phase 3: User Story 1 - Crear un pedido anticipado (Priority: P1) 🎯 MVP

**Goal**: El cliente arma un pedido con platillos disponibles del menú del día; el sistema valida
la ventana, congela precios, calcula el total y genera un folio.

**Independent Test**: Un `usuario` autenticado crea un pedido dentro de la ventana y obtiene un
pedido `Pendiente` con folio y total correctos; fuera de la ventana recibe `422`.

### Tests for User Story 1 ⚠️

- [x] T011 [P] [US1] Prueba en `backend/tests/pedidos.test.ts`: crear pedido válido (estado `Pendiente`, folio único, total = suma de líneas); ventana cerrada → `422`; platillo no disponible → `422`; línea inválida → `400`
- [x] T012 [P] [US1] Prueba en `frontend/tests/Carrito.test.tsx`: selección de platillos, cantidades y total mostrado

### Implementation for User Story 1

- [x] T013 [US1] Implementar `backend/src/services/pedidos.service.ts`: `crear(usuarioId, lineas)` — valida ventana, disponibilidad del `menu_dia`, toma `precio` del servidor, calcula `subtotal`/`total`, inserta `pedido` + `pedido_detalle` en una transacción
- [x] T014 [US1] Implementar `backend/src/controllers/pedidos.controller.ts` (`POST /pedidos`, `GET /pedidos/{id}`) verificando la propiedad del pedido
- [x] T015 [P] [US1] Implementar el carrito en `frontend/src/pages/clientes/Carrito.tsx` con `frontend/src/components/clientes/Carrito.tsx`
- [x] T016 [US1] Registrar la ruta `/pedido` en `frontend/src/router.tsx` (rol usuario)

**Checkpoint**: US1 funcional de forma independiente

---

## Phase 4: User Story 2 - Pagar el pedido en línea (Priority: P1) 🎯 MVP

**Goal**: El cliente confirma el pago; el sistema registra el `pago` y avanza el pedido a
`Pagado` de forma idempotente.

**Independent Test**: Al confirmar el pago de un pedido `Pendiente` propio, este pasa a
`Pagado` con un `pago` aprobado; un reintento no duplica el pago ni la transición.

### Tests for User Story 2 ⚠️

- [x] T017 [P] [US2] Prueba en `backend/tests/pago.test.ts`: pago aprobado → `Pagado`; pago rechazado → `422` y pedido sigue `Pendiente`; reintento idempotente; pagar pedido ajeno → `403`; estado no pagable → `409`
- [x] T018 [P] [US2] Prueba en `frontend/tests/Carrito.test.tsx` (o `Pago.test.tsx`): flujo de confirmación de pago y transición a `Pagado`

### Implementation for User Story 2

- [x] T019 [US2] Implementar `backend/src/services/pago.service.ts`: `pagar(pedidoId, usuarioId, token)` — verifica propiedad y estado, invoca `gateway.cobrar`, registra `pago` (`aprobado`/`rechazado`) y, si aprueba, llama a `estado.service.registrarCambio` a `Pagado` dentro de una transacción idempotente
- [x] T020 [US2] Implementar el endpoint `POST /pedidos/{id}/pagar` en `backend/src/controllers/pedidos.controller.ts`
- [x] T021 [P] [US2] Implementar la página `frontend/src/pages/clientes/Pago.tsx` (confirmación y resultado del pago)
- [x] T022 [US2] Registrar la ruta `/pedido/pago` en `frontend/src/router.tsx` (rol usuario)

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a ambas historias

- [x] T023 [P] Manejo uniforme de errores (`400/403/404/409/422`) con `errorHandler` y ausencia de stack traces al usuario (§14)
- [x] T024 [P] Revisar accesibilidad y contraste de `/pedido` y `/pedido/pago` (§19)
- [x] T025 Ejecutar `typecheck`, `lint` y toda la suite de pruebas en backend y frontend; corregir hallazgos
- [x] T026 Validar los escenarios de `quickstart.md` y actualizar la documentación si cambia algún contrato

---

## Dependencies & Execution Order

- **Setup (T001–T003)**: sin dependencias.
- **Foundational (T004–T010)**: depende del Setup; bloquea ambas historias.
- **US1 (T011–T016)** y **US2 (T017–T022)**: dependen de Foundational; US2 requiere el pedido
  creado por US1 (T013).
- **Polish (T023–T026)**: al finalizar las historias.

## Parallel Execution Examples

- T004, T005, T006 y T007 pueden ejecutarse en paralelo (archivos backend distintos).
- T011, T012 y T018 pueden escribirse en paralelo (archivos de prueba distintos).
- T021 puede avanzar en paralelo con T019/T020 usando el contrato de `contracts/openapi.yaml`.
