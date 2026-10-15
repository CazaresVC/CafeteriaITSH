---
description: "Task list for Republicar el menú del día en un clic"
---

# Tasks: Republicar el menú del día en un clic

**Input**: Design documents from `/specs/008-republicar-menu/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos para la lógica crítica (§VIII): idempotencia, omisión de inactivos, ausencia
de menú previo, validación de fecha y permisos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1 (republicar) o US2 (consola de admin)

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar convenciones y condiciones previas

- [x] T001 [P] Confirmar el patrón de capas del backend (ruta→controlador→servicio con `zod`) y la
  ausencia de dependencias nuevas (§22)
- [x] T002 [P] Confirmar que `menu_dia` tiene la restricción única `(fecha, platillo_id)` que
  garantiza la idempotencia (data-model.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Definir el contrato de entrada y el tipo de resultado

- [x] T003 [P] Añadir `menuRepublicarSchema` (`{ fecha?: YYYY-MM-DD }`) en
  `backend/src/utils/schemas/menu.schema.ts`
- [x] T004 [P] Añadir el tipo `ResultadoRepublicacion` (`{ fecha, origen, agregados, omitidos }`)
  en `backend/src/tipos.ts`

**Checkpoint**: Contrato y tipos listos — US1 puede comenzar

---

## Phase 3: User Story 1 - Republicar el menú en un clic (Priority: P1) 🎯 MVP

**Goal**: `POST /api/menu/republicar` (solo admin) copia el menú más reciente al destino,
omitiendo inactivos y duplicados, y devuelve el resumen.

**Independent Test**: Con solo un menú pasado (8 ítems) y destino vacío, una petición deja el
destino con esos 8 ítems y responde `agregados = 8`; repetir devuelve `agregados = 0`.

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Pruebas del endpoint en `backend/tests/menu.test.ts`: éxito con
  agregados/omitidos, fecha por defecto (hoy), `404` sin menú previo, `400` fecha inválida y
  `403` rol no admin

### Implementation for User Story 1

- [x] T006 [US1] Implementar `republicar()` en `backend/src/services/menu.service.ts`
  (`MAX(fecha)` origen + `INSERT ... SELECT` con `NOT EXISTS` y `platillo.activo = 1`)
- [x] T007 [US1] Añadir el handler `republicar` en `backend/src/controllers/menu.controller.ts`
  (fecha por defecto = hoy)
- [x] T008 [US1] Declarar `POST /republicar` (solo `administrador`) en
  `backend/src/routes/menu.routes.ts`, antes de las rutas `/:id`
- [x] T009 [US1] Verificar en vivo contra MySQL: copia (agregados = N) e idempotencia
  (agregados = 0)

**Checkpoint**: US1 funcional y verificable de forma independiente

---

## Phase 4: User Story 2 - Consola de menú clara y atractiva (Priority: P2)

**Goal**: La consola `/admin/menu` ofrece una sección Republicar ligada a la fecha, con aviso de
resultado y errores claros.

**Independent Test**: En `/admin/menu`, el admin pulsa Republicar y ve el aviso con el resultado;
el estado vacío sugiere la acción.

### Implementation for User Story 2

- [x] T010 [P] [US2] Añadir `useRepublicarMenu()` y `ResultadoRepublicacion` en
  `frontend/src/lib/menu.ts`
- [x] T011 [US2] Añadir la sección “Republicar” (ícono, texto de ayuda, botón, aviso de éxito y
  error) en `frontend/src/pages/admin/Menu.tsx`
- [x] T012 [US2] Actualizar el estado vacío de “Platillos publicados” para sugerir Republicar

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentación y verificación final

- [x] T013 [P] Registrar el contrato en `specs/008-republicar-menu/contracts/openapi.yaml`
- [x] T014 [P] Anotar el uso de Republicar en `Docs/demo-sprint5.md`
- [x] T015 Ejecutar `npm.cmd test`, `typecheck`, `build` (backend) y `test`, `typecheck`, `lint`,
  `build` (frontend) en verde (SC-003)
- [x] T016 Confirmar sin dependencias nuevas (SC-005) y sin cambios en roles/pedidos (SC-004)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **US1 (Phase 3)** → **US2 (Phase 4)** →
  **Polish (Phase 5)**
- US2 depende de que US1 exponga el endpoint.

### Parallel Opportunities

- T001–T002 en paralelo; T003–T004 en paralelo; T005 (pruebas) puede escribirse junto con T006–
  T008; T010 y T013–T014 en paralelo.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fases 1–2 → 3 (US1).
2. **STOP y VALIDAR**: endpoint en verde y probado en vivo por API.

### Incremental Delivery

1. US1 → validar → demo (republicar por API).
2. US2 → validar → demo (botón en la consola del admin).
3. Polish → contrato, doc y verificaciones.

---

## Notes

- [P] = archivos distintos, sin dependencias.
- No se toca el esquema ni las migraciones; se reutiliza `menu_dia`.
- Respuestas en **camelCase**; errores con sobre uniforme.
- Sin dependencias npm nuevas (§22).
