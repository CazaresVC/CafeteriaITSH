---
description: "Task list for Gestión y consulta del menú (Sprint 2)"
---

# Tasks: Gestión y consulta del menú (Sprint 2)

**Input**: Design documents from `/specs/003-menu-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos (la constitución §20 exige pruebas de la lógica crítica: validación y
gestión de platillos/menú, cálculo de precios y control de permisos por rol).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US7 o US1
- Incluir rutas de archivo exactas en las descripciones

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`
- **Migraciones**: `database/migrations/` (ya existentes; esta feature no crea migraciones)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar la infraestructura del Sprint 1 reutilizada por esta feature

- [x] T001 Verificar la estructura existente en `backend/src/{config,db,middlewares,routes,controllers,services,utils}` y `frontend/src/{lib,components/ui,pages/{admin,clientes}}` y los scripts (`dev`, `test`, `typecheck`, `migrate`) según plan.md
- [x] T002 [P] Confirmar dependencias existentes (`express`, `mysql2`, `zod`, `jsonwebtoken`, `@tanstack/react-query`, `axios`, Tailwind, shadcn/ui) en `backend/package.json` y `frontend/package.json`; no agregar dependencias nuevas (constitución §8/§20)
- [x] T003 [P] Revisar `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql` y confirmar tablas (`platillo`, `menu_dia`), restricciones (`uq_menu_dia_fecha_platillo`, `chk_menu_dia_precio`) e índices

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos de datos, esquemas de validación y hooks compartidos por ambas historias

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [x] T004 [P] Implementar esquemas zod en `backend/src/utils/schemas/platillos.schema.ts` (`PlatilloInput`, `PlatilloPatch`) y `backend/src/utils/schemas/menu.schema.ts` (`MenuItemInput`, `MenuItemPatch`, filtro de `fecha`)
- [x] T005 Implementar el servicio del catálogo en `backend/src/services/platillos.service.ts` (`listar`, `crear`, `editar`, `desactivar`)
- [x] T006 Implementar el servicio del menú en `backend/src/services/menu.service.ts` (`listarPorFecha` con unión a `platillo` filtrando `activo = 1`, `agregar`, `actualizar`, `quitar`) validando `(fecha, platillo_id)` único y `precio >= 0`
- [x] T007 [P] Implementar hooks de TanStack Query en `frontend/src/lib/menu.ts` (`usePlatillos`, `useMenu(fecha)`, mutaciones que invalidan las queries)
- [x] T008 Montar `platillos.routes.ts` y `menu.routes.ts` en `backend/src/app.ts` con `requireAuth` y `requireRole('administrador')` en las rutas de gestión (la consulta sólo requiere `requireAuth`)

**Checkpoint**: Infraestructura lista — las historias pueden comenzar

---

## Phase 3: User Story 7 - Mantener el menú, platillos y precios (Priority: P1) 🎯 MVP

**Goal**: El administrador crea/edita platillos, publica el menú del día, ajusta precios, marca
disponibilidad y define especiales.

**Independent Test**: Un administrador autenticado crea un platillo, lo agrega al menú de una
fecha con precio, cambia el precio y marca disponibilidad; un usuario no administrador recibe
`403` al intentar gestionar.

### Tests for User Story 7 ⚠️

- [x] T009 [P] [US7] Prueba en `backend/tests/platillos.test.ts`: crear/editar/listar/desactivar platillo; validación de `nombre` y rol (`403` para no administrador)
- [x] T010 [P] [US7] Prueba en `backend/tests/menu.test.ts`: agregar ítem, precio inválido (`400`), duplicado `(fecha, platillo_id)` (`409`), actualizar precio/disponibilidad/especial, quitar

### Implementation for User Story 7

- [x] T011 [US7] Implementar controlador de catálogo en `backend/src/controllers/platillos.controller.ts` (mapea `GET/POST/PATCH/DELETE /platillos`)
- [x] T012 [US7] Implementar controlador del menú en `backend/src/controllers/menu.controller.ts` (mapea `GET/POST/PATCH/DELETE /menu`)
- [x] T013 [P] [US7] Implementar página de gestión de platillos en `frontend/src/pages/admin/Platillos.tsx` con `frontend/src/components/menu/PlatilloForm.tsx`
- [x] T014 [P] [US7] Implementar página del menú del día en `frontend/src/pages/admin/Menu.tsx` (agregar/quitar platillos, ajustar precio, disponibilidad, especial)
- [x] T015 [US7] Registrar las rutas de administración en `frontend/src/router.tsx` (`/admin/platillos`, `/admin/menu`)

**Checkpoint**: La gestión del menú funciona de forma independiente

---

## Phase 4: User Story 1 - Consultar el menú (Priority: P1) 🎯 MVP

**Goal**: Cualquier usuario autenticado consulta el menú del día de forma clara, rápida y
responsiva, distinguiendo los platillos no disponibles.

**Independent Test**: Un `usuario` autenticado abre `/menu` y ve los platillos de hoy con
nombre y precio; los no disponibles aparecen identificados y no son seleccionables.

### Tests for User Story 1 ⚠️

- [x] T016 [P] [US1] Prueba en `backend/tests/menu.test.ts`: consulta por fecha devuelve sólo `platillo.activo = 1` con `disponible`/`especial` correctos
- [x] T017 [P] [US1] Prueba en `frontend/tests/Menu.test.tsx`: la vista del cliente muestra el menú y marca los no disponibles como no seleccionables

### Implementation for User Story 1

- [x] T018 [US1] Implementar la vista de consulta en `frontend/src/pages/clientes/Menu.tsx` usando `frontend/src/components/menu/PlatilloCard.tsx` (nombre, precio, categoría, especial, no disponible)
- [x] T019 [US1] Registrar la ruta `/menu` en `frontend/src/router.tsx` protegida por `requireAuth` y accesible a todos los roles
- [x] T020 [US1] Asegurar diseño responsivo y legible en móvil de `/menu` (SC-003) y refresco al volver a la pantalla (`staleTime` corto)

**Checkpoint**: US7 y US1 funcionan de forma independiente

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a ambas historias

- [x] T021 [P] Manejo uniforme de errores (`400/401/403/404/409`) con `errorHandler` y ausencia de stack traces al usuario (§14)
- [x] T022 [P] Revisar accesibilidad y contraste de la vista `/menu` y de las pantallas de administración (§19)
- [x] T023 Ejecutar `typecheck`, `lint` y toda la suite de pruebas en backend y frontend; corregir hallazgos
- [x] T024 Validar los escenarios de `quickstart.md` y actualizar la documentación si cambia algún contrato

---

## Dependencies & Execution Order

- **Setup (T001–T003)**: sin dependencias.
- **Foundational (T004–T008)**: depende del Setup; bloquea ambas historias.
- **US7 (T009–T015)** y **US1 (T016–T020)**: dependen de Foundational; pueden avanzar en paralelo
  (US1 consume `GET /menu` implementado en T006/T012).
- **Polish (T021–T024)**: al finalizar las historias.

## Parallel Execution Examples

- T004 y T007 pueden ejecutarse en paralelo (esquemas backend vs hooks frontend).
- T013 y T014 pueden ejecutarse en paralelo (páginas admin distintas).
- T009, T010 y T017 pueden escribirse en paralelo (archivos de prueba distintos).

## Notas de implementación

- T036 café/actualización de menú y consulta por fecha: implementado en
  `backend/src/services/{platillos,menu}.service.ts`; el precio se congela en `menu_dia` al agregar.
- Consulta de menú devuelve sólo `platillo.activo = 1` con `disponible`/`especial` correctos
  (T016); la vista del cliente marca los no disponibles como no seleccionables (T017).
