---
description: "Task list for Mostrador y cocina (Sprint 4)"
---

# Tasks: Mostrador y cocina (Sprint 4)

**Input**: Design documents from `/specs/005-counter-kitchen/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos (la constitución §20 exige pruebas de la lógica crítica: creación y
validación de pedidos, cálculo de totales, cambios de estado y control de permisos por rol).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2 o US3
- Incluir rutas de archivo exactas en las descripciones

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`
- **Migraciones**: `database/migrations/` (ya existentes; esta feature no crea migraciones)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la infraestructura del Sprint 1 reutilizada por esta feature

- [ ] T001 Verificar la estructura existente en `backend/src/{config,db,middlewares,routes,controllers,services,utils}` y `frontend/src/{lib,components/ui,pages/{caja,cocina}}` y los scripts (`dev`, `test`, `typecheck`, `migrate`) según plan.md
- [ ] T002 [P] Confirmar dependencias existentes (`express`, `mysql2`, `zod`, `jsonwebtoken`, `@tanstack/react-query`, `axios`, Tailwind, shadcn/ui) en `backend/package.json` y `frontend/package.json`; no agregar dependencias nuevas (constitución §8/§20)
- [ ] T003 [P] Revisar `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql` y confirmar tablas (`pedido`, `pedido_detalle`, `pago`, `estado_pedido`, `transicion_estado`, `pedido_estado_historial`) y transiciones sembradas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida por todas las historias (máquina de estados, folio, validación, polling)

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [ ] T004 [P] Implementar generación de folio en `backend/src/utils/numero.ts` (número de pedido único para `pedido.numero`)
- [ ] T005 [P] Implementar esquemas zod de entrada en `backend/src/utils/schemas/pedidos.schema.ts` (`CrearMostradorInput`, `CobroInput`, `CambioEstadoInput`)
- [ ] T006 Implementar la máquina de estados en `backend/src/services/estado.service.ts`: `validarTransicion(estadoActualId, estadoNuevoId)` consultando `transicion_estado`, y `registrarCambio(conn, pedidoId, desdeId, haciaId, usuarioId)` que actualiza `pedido.estado_id` e inserta en `pedido_estado_historial` dentro de una transacción
- [ ] T007 [P] Implementar hooks de TanStack Query en `frontend/src/lib/pedidos.ts` (`usePedidos` con `refetchInterval: 5000`, `usePedido`, mutaciones de crear/cobrar/cambiar estado que invalidan la query)

**Checkpoint**: Infraestructura lista — las historias pueden comenzar

---

## Phase 3: User Story 1 - Capturar y cobrar pedidos de mostrador (Priority: P1) 🎯 MVP

**Goal**: El cajero captura pedidos presenciales (`tipo='mostrador'`, total calculado) y
registra su cobro en efectivo, moviéndolos a `Pagado`.

**Independent Test**: Un cajero autenticado captura un pedido de mostrador, lo cobra y este
entra a la misma cola de preparación que los anticipados.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Test de integración de creación y cobro de mostrador en `backend/tests/mostrador.test.ts` (201 con total correcto, `tipo='mostrador'`, `creado_por`=cajero; cobro 200 → `Pagado`; doble cobro 409; sin rol `cajero` 403)
- [ ] T009 [P] [US1] Test unitario del cálculo del total y validación de ítems (`cantidad > 0`, `menu_dia` no disponible rechazado) en `backend/tests/unit/totales.test.ts`

### Implementation for User Story 1

- [ ] T010 [P] [US1] Implementar `crearMostrador` en `backend/src/services/pedidos.service.ts` (inserta `pedido` + `pedido_detalle` en una transacción; `usuario_id`/`fecha_recoleccion` nulos; total desde `menu_dia.precio`)
- [ ] T011 [P] [US1] Implementar `registrarCobro` en `backend/src/services/pago.service.ts` (inserta `pago` con `metodo='efectivo'`, `monto = total`, `registrado_por`=cajero y usa `estado.service` para `Pendiente → Pagado`)
- [ ] T012 [US1] Implementar `backend/src/controllers/pedidos.controller.ts` y `backend/src/routes/pedidos.routes.ts` (`POST /pedidos/mostrador`, `POST /pedidos/{id}/cobro` con `requireRole('cajero')`); montar las rutas en `backend/src/app.ts`
- [ ] T013 [US1] Implementar `frontend/src/components/caja/PedidoMostrador.tsx` (selección de platillos del menú, cantidades, total y `cliente_nombre` opcional) con react-hook-form + zod
- [ ] T014 [P] [US1] Implementar `frontend/src/components/BotonEstado.tsx` (botón reutilizable de alto contraste con área táctil ≥ 44 px)
- [ ] T015 [US1] Implementar captura y cobro en `frontend/src/pages/caja/Caja.tsx` usando `frontend/src/lib/pedidos.ts`

**Checkpoint**: US1 funcional y verificable de forma independiente

---

## Phase 4: User Story 2 - Preparar pedidos en la pantalla de cocina (Priority: P1)

**Goal**: El cocinero ve los pedidos entrantes (anticipados y de mostrador) ordenados por
llegada con sus productos y cantidades, y los mueve a `En preparación` y `Listo` con refresco
automático.

**Independent Test**: Un cocinero autenticado ve los pedidos pagados ordenados por llegada y
puede mover un pedido a `En preparación` y luego a `Listo`.

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Test de integración de `GET /pedidos?estado=&origen=` en `backend/tests/cocina.test.ts` (mezcla ambos orígenes, orden por `creado_en`, filtros por estado y origen)
- [ ] T017 [P] [US2] Test de integración de `PATCH /pedidos/{id}/estado` en `backend/tests/cocina.test.ts` (`Pagado → En preparación`, `En preparación → Listo`, y rechazo 409 de salto `Pagado → Listo`)

### Implementation for User Story 2

- [ ] T018 [US2] Implementar `listarPedidos` en `backend/src/services/pedidos.service.ts` (filtros `estado`/`origen`; orden `creado_en ASC, id ASC`; incluye líneas de detalle para la KDS)
- [ ] T019 [US2] Implementar `obtenerPedido` en `backend/src/services/pedidos.service.ts` (detalle + `pedido_estado_historial`)
- [ ] T020 [US2] Implementar `cambiarEstado` en `backend/src/services/pedidos.service.ts` (lee el pedido con `SELECT ... FOR UPDATE`, valida con `estado.service` y registra el cambio); exponer `GET /pedidos`, `GET /pedidos/{id}` y `PATCH /pedidos/{id}/estado` con `requireRole('cajero', 'cocinero')` en `pedidos.controller.ts` y `pedidos.routes.ts`
- [ ] T021 [US2] Implementar `frontend/src/components/cocina/PedidoCard.tsx` (folio, origen, productos y cantidades, tiempo de espera, acciones de estado)
- [ ] T022 [US2] Implementar la KDS en `frontend/src/pages/cocina/Cocina.tsx` con `usePedidos` (polling) y acciones `En preparación`/`Listo`

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Entrega y cancelación de pedidos (Priority: P2)

**Goal**: El personal marca un pedido `Listo` como `Entregado` y puede cancelar un pedido en
cualquier estado previo a `Entregado`, rechazando transiciones inválidas y cambios sobre
estados terminales.

**Independent Test**: Un pedido `Listo` puede marcarse como `Entregado`; un pedido en estado
previo puede cancelarse; las transiciones inválidas se rechazan.

### Tests for User Story 3 ⚠️

- [ ] T023 [P] [US3] Test de integración de entrega y cancelación en `backend/tests/transiciones.test.ts` (`Listo → Entregado`; `Pagado → Cancelado` y `En preparación → Cancelado`; rechazo 409 de cambios sobre `Entregado`/`Cancelado` y de saltos)

### Implementation for User Story 3

- [ ] T024 [US3] Extender `cambiarEstado` en `backend/src/services/pedidos.service.ts` para aceptar `Entregado` y `Cancelado` (la validez ya proviene de `transicion_estado`; `Entregado`/`Cancelado` quedan sin transiciones de salida)
- [ ] T025 [US3] Añadir acciones de `Entregado` y `Cancelado` (con confirmación) en `frontend/src/components/cocina/PedidoCard.tsx` y `frontend/src/pages/caja/Caja.tsx`
- [ ] T026 [US3] Mostrar los estados terminales como no accionables en `PedidoCard.tsx` (sin botones de transición) y mensajes claros de error `409` en el frontend

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias

- [ ] T027 [P] Documentar los endpoints de pedidos y el flujo de estados en `backend/README.md`
- [ ] T028 [P] Añadir test de concurrencia (dos actualizaciones sobre el mismo pedido → una gana, otra 409) en `backend/tests/transiciones.test.ts`
- [ ] T029 [P] Añadir test de componente en `frontend/tests/Cocina.test.tsx` (render y refresco vía polling con TanStack Query) y `frontend/tests/Caja.test.tsx` (captura y cobro)
- [ ] T030 Verificar accesibilidad de caja y cocina: área táctil ≥ 44 px y alto contraste (constitución §19) en `frontend/src/components/BotonEstado.tsx`
- [ ] T031 Verificar `npm run typecheck` y `npm test` en verde en `backend` y `frontend`
- [ ] T032 Ejecutar los escenarios de `quickstart.md` y registrar resultados para la demo del sprint

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **User Stories (Phases 3–5)**: dependen de Foundational; US1 y US2 son P1, US3 es P2
- **Polish (Phase 6)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: sin dependencias tras Foundational; usa la máquina de estados para `Pendiente → Pagado`
- **US2 (P1)**: reutiliza `estado.service` (Foundational); independiente de US1 en prueba, pero la KDS muestra pedidos de ambos orígenes
- **US3 (P2)**: extiende `cambiarEstado` de US2; independiente en prueba una vez existe el endpoint de estado

### Within Each User Story

- Tests escritos y en fallo antes de la implementación
- Servicios antes de controladores/rutas
- Controladores/rutas antes del frontend
- Historia completa antes de pasar a la siguiente prioridad

### Parallel Opportunities

- T002–T003 en paralelo; T004–T005 y T007 en paralelo dentro de Foundational
- Tests de cada historia en paralelo (T008/T009, T016/T017, T023)
- T010/T011 y T014 en paralelo dentro de US1

---

## Parallel Example: User Story 1

```bash
# Lanzar los tests de US1 juntos (si se solicitan):
Task: "Test de integración de creación y cobro de mostrador en backend/tests/mostrador.test.ts"
Task: "Test unitario del cálculo del total y validación de ítems en backend/tests/unit/totales.test.ts"

# Lanzar servicios de US1 juntos:
Task: "Implementar crearMostrador en backend/src/services/pedidos.service.ts"
Task: "Implementar registrarCobro en backend/src/services/pago.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea todas las historias)
3. Completar Phase 3: User Story 1
4. **STOP y VALIDAR**: captura y cobro de mostrador de forma independiente
5. Demo si está listo

### Incremental Delivery

1. Setup + Foundational → infraestructura lista
2. US1 → validar → demo (captura y cobro en caja)
3. US2 → validar → demo (KDS con ambos orígenes y refresco en vivo)
4. US3 → validar → demo del sprint (entrega y cancelación)

### Parallel Team Strategy

Con varias personas:

1. El equipo completa Setup + Foundational en conjunto
2. Al terminar Foundational:
   - Persona A: User Story 1 (caja)
   - Persona B: User Story 2 (cocina)
3. US3 se integra al final sobre el endpoint de estado

---

## Notes

- [P] = archivos distintos, sin dependencias
- Etiqueta [Story] para trazabilidad con `spec.md` (US1/US2/US3) y con la spec maestra 001 (FR-019…FR-025, FR-031…FR-035)
- El refresco en vivo usa polling de TanStack Query (5 s); no se incorporan WebSocket/SSE
- Commit tras cada tarea o grupo lógico; no versionar `.env`
