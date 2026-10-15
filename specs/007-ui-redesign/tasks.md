---
description: "Task list for Tokens de diseño (DESIGN.md) en el frontend"
---

# Tasks: Tokens de diseño (DESIGN.md) en el frontend

**Input**: Design documents from `/specs/007-ui-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Incluidos de forma mínima (prueba de humo / no regresión de API de componentes).
La funcionalidad es de presentación; no hay lógica de negocio nueva que requiera cobertura
de estados, pagos o permisos (§VIII). Las pruebas existentes MUST seguir en verde.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2 o US3

## Path Conventions

- **Frontend**: `frontend/src/`, `frontend/index.html`, `frontend/package.json`
- **Sin backend ni base de datos** en esta funcionalidad

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el mecanismo y las condiciones previas del tema

- [x] T001 [P] Confirmar el mecanismo de tokens: Tailwind v4 con bloque `@theme` en `frontend/src/index.css` y ausencia de `tailwind.config.js` (no se añaden dependencias)
- [x] T002 [P] Definir la estrategia de fuentes: pila de respaldo del sistema y, opcionalmente, enlace a fuente web con respaldo local en `frontend/index.html` (research §4)
- [x] T003 [P] Confirmar los scripts de `frontend/package.json` (`typecheck`, `test`, `lint`, `build`) y que **no** se agregan dependencias (§22)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Traducir `Docs/DESIGN.md` a nombres de token antes de tocar componentes

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [x] T004 [P] Mapear los valores de `Docs/DESIGN.md` (`colors`, `typography`, `rounded`, `spacing`) a nombres de token (`--color-*`, `--font-heading`, `--font-body`, `--radius-*`) según research §2

**Checkpoint**: Nomenclatura de tokens fijada — las historias pueden comenzar

---

## Phase 3: User Story 1 - Tokens base del sistema de diseño (Priority: P1) 🎯 MVP

**Goal**: Los tokens de `DESIGN.md` existen y el tema global (fondo, texto, tipografía) los
consume, sin cambiar comportamiento.

**Independent Test**: Existe el bloque `@theme` con los tokens, el tema global los usa y
`typecheck`/`test`/`lint`/`build` siguen en verde.

### Tests for User Story 1 ⚠️

- [x] T005 [P] [US1] Prueba de humo (React Testing Library) que monte una página/layout existente y garantice que el tema no rompe el render en `frontend/tests/` (o reutilizar una prueba existente)

### Implementation for User Story 1

- [x] T006 [US1] Implementar el bloque `@theme` con todos los tokens de `DESIGN.md` en `frontend/src/index.css` (colores de superficie/marca/estado, fuentes, radios y espaciado)
- [x] T007 [US1] Aplicar los tokens al tema global en `frontend/src/index.css` (`body`: fondo `surface`, color `on-surface`, `font-body`)
- [x] T008 [US1] Verificar `npm.cmd run typecheck`, `test`, `lint` y `build` en verde tras el cambio de tokens

**Checkpoint**: US1 funcional y verificable de forma independiente

---

## Phase 4: User Story 2 - Componentes base y layout con tokens (Priority: P2)

**Goal**: Botones, tarjetas, entradas, etiquetas y el encabezado del layout usan tokens,
conservando variantes, API y navegación.

**Independent Test**: Los componentes base y el encabezado usan tokens; las variantes del
botón y la navegación del layout siguen funcionando igual.

### Tests for User Story 2 ⚠️

- [x] T009 [P] [US2] Prueba de no regresión de que `Button` conserva sus variantes y su API pública en `frontend/tests/` (si aporta valor)

### Implementation for User Story 2

- [x] T010 [P] [US2] Migrar `frontend/src/components/ui/button.tsx` a tokens (variantes `primary`/`secondary`/`ghost`/`danger`; conservar props)
- [x] T011 [P] [US2] Migrar `frontend/src/components/ui/card.tsx` a tokens (superficie, borde, radio, sombra)
- [x] T012 [P] [US2] Migrar `frontend/src/components/ui/input.tsx` a tokens (borde `outline`, foco verde 2 px)
- [x] T013 [P] [US2] Migrar `frontend/src/components/ui/label.tsx` a tokens (color `on-surface`)
- [x] T014 [US2] Migrar las superficies/texto del encabezado en `frontend/src/components/LayoutModulo.tsx` a tokens **sin** alterar su estructura, enlaces ni el botón "Salir"

**Checkpoint**: US2 funcional; la apariencia base es coherente con `DESIGN.md`

---

## Phase 5: User Story 3 - Colores de estado de pedido con tokens (Priority: P3)

**Goal**: Las insignias de estado usan `status-*` y coinciden entre cocina y cliente.

**Independent Test**: El mismo estado muestra el mismo color en `/cocina` y en `/mis-pedidos`.

### Implementation for User Story 3

- [x] T015 [P] [US3] Migrar el mapa `COLOR_ESTADO` de `frontend/src/pages/clientes/MisPedidos.tsx` a tokens `status-*` (con degradación neutra para estados desconocidos)
- [x] T016 [P] [US3] Migrar el mapa `COLOR_ESTADO` de `frontend/src/components/cocina/PedidoCard.tsx` a tokens `status-*` (misma degradación)
- [x] T017 [US3] Verificar la coincidencia de color por estado entre cocina y cliente (FR-005/SC-003)

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de la funcionalidad

- [x] T018 [P] Revisar contraste (AA) de las combinaciones principales y los tamaños táctiles ≥ 44 px en caja y cocina
- [x] T019 [P] Confirmar con `git diff --stat` que no hay cambios en `backend/`, `database/`, `frontend/src/lib/` ni `frontend/src/router.tsx` (SC-004)
- [x] T020 Verificar `frontend/package.json` sin dependencias nuevas (SC-005)
- [x] T021 Ejecutar `npm.cmd run typecheck`, `test`, `lint` y `build` en verde (SC-001)
- [ ] T022 Ejecutar los escenarios de `quickstart.md` y registrar resultados
- [ ] T023 Confirmar la trazabilidad de FR-001…FR-008 y SC-001…SC-005

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — bloquea todas las historias
- **User Stories (Phases 3–5)**: dependen de Foundational; US1 (P1) es el MVP; US2 (P2) y
  US3 (P3) son incrementales y siguen a US1
- **Polish (Phase 6)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: sin dependencias tras Foundational (define el tema)
- **US2 (P2)**: depende de los tokens de US1 (T006)
- **US3 (P3)**: depende de los tokens de estado de US1 (T006)

### Within Each User Story

- Los componentes base antes del layout
- Núcleo antes de la integración; una historia completa antes de la siguiente prioridad

### Parallel Opportunities

- T001–T003 en paralelo; T010–T013 en paralelo; T015–T016 en paralelo
- T018–T019 en paralelo

---

## Parallel Example: User Story 2

```bash
# Migrar los componentes base en paralelo (archivos distintos):
Task: "Migrar frontend/src/components/ui/button.tsx a tokens"
Task: "Migrar frontend/src/components/ui/card.tsx a tokens"
Task: "Migrar frontend/src/components/ui/input.tsx a tokens"
Task: "Migrar frontend/src/components/ui/label.tsx a tokens"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3 (US1)
2. **STOP y VALIDAR**: tokens definidos, tema global aplicado, comandos en verde
3. Demo si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → demo (identidad visual del proyecto)
3. US2 → validar → demo (componentes y encabezado coherentes)
4. US3 → validar → demo (estados de pedido consistentes en cocina y cliente)
5. Cada historia añade valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias
- Etiqueta [Story] para trazabilidad con `spec.md`
- No se toca `router.tsx`, `src/lib/*`, `backend/` ni `database/`
- La paleta por defecto de Tailwind se mantiene (solo se añaden tokens) para no romper
  pantallas no migradas
- Sin dependencias npm nuevas (§22)
- Commit tras cada tarea o grupo lógico
