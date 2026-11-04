---
description: "Task list for Tokens de diseño y rediseño de navegación/pantallas por rol"
---

# Tasks: Tokens de diseño y rediseño de navegación/pantallas por rol

**Input**: Design documents from `/specs/007-ui-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Tokens con prueba de humo / no regresión. La extensión CFITSH-25…29 actualiza las
pruebas de caja, cocina, menú, carrito y pedidos porque cambian la interacción (pasos, chips,
steppers, contexto). Las pruebas existentes MUST seguir en verde.

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1…US7

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
- [x] T019 [P] Confirmar con `git diff --stat` que la fase de tokens no cambió `backend/`, `database/`, `frontend/src/lib/` ni `frontend/src/router.tsx` (SC-004)
- [x] T020 Verificar `frontend/package.json` sin dependencias nuevas (SC-005)
- [x] T021 Ejecutar `npm.cmd run typecheck`, `test`, `lint` y `build` en verde (SC-001)
- [ ] T022 Ejecutar los escenarios de `quickstart.md` y registrar resultados
  - Evidencia pendiente de la ejecución visual (login, menú, caja, cocina); el checklist está
    preparado en `Docs/qa/accesibilidad.md`.
- [x] T023 Confirmar la trazabilidad de FR-001…FR-008 y SC-001…SC-005
  - Registrada en `specs/010-quality-assurance/traceability.md` (FR-001…FR-040 y SC-001…SC-009).

---

## Extensión CFITSH-25…29 (2026-11-02)

**Goal**: Drawer/bottom bar + rediseño de caja, cocina, cliente y administración sin cambiar
rutas, endpoints ni lógica de negocio.

### Phase 7: Navegación y layouts (US4-US7)

- [x] T024 [P] Extender `EnlaceNavegacion` con `query` y crear `frontend/src/components/layout/activo.ts` (`enlaceActivo`/`destinoEnlace`)
- [x] T025 [P] Reescribir `frontend/src/components/layout/DrawerLateral.tsx` y `BarraInferior.tsx` con el helper de enlace activo
- [x] T026 [US4-US7] Reescribir `frontend/src/components/LayoutModulo.tsx`: sidebar fijo `lg:`, header sticky, hamburguesa, drawer, bottom bar, perfil/logout y slot `acciones`; limpiar carrito al salir
- [x] T027 [P] [US4] Rediseñar `frontend/src/pages/caja/CajaLayout.tsx` con badge de pedidos `Listo` (polling 5 s)
- [x] T028 [P] [US5] Rediseñar `frontend/src/pages/cocina/CocinaLayout.tsx`
- [x] T029 [P] [US6] Rediseñar `frontend/src/pages/clientes/ClientesLayout.tsx` (bottom bar oculto en `/pedido*`, `NotificacionBadge`)
- [x] T030 [P] [US7] Rediseñar `frontend/src/pages/admin/AdminLayout.tsx`

### Phase 8: UI compartida

- [x] T031 [P] Crear `frontend/src/components/ui/buscador.tsx`, `chips-categoria.tsx`, `boton-flotante-cobro.tsx` y `panel-lateral.tsx`
- [x] T032 [P] Añadir `className` opcional a `frontend/src/components/BotonEstado.tsx` para reutilización

### Phase 9: Caja (US4)

- [x] T033 [US4] Reescribir `frontend/src/components/caja/PedidoMostrador.tsx` (búsqueda, chips, stepper, barra de total, `onContinuar` y resumen)
- [x] T034 [US4] Reescribir `frontend/src/pages/caja/Caja.tsx` con pasos `inicio`/`captura`/`cobro`/`resultado` vía `useSearchParams`; encadenar `useCrearMostrador` + `useCobrarPedido` y reintento de cobro

### Phase 10: Cocina (US5)

- [x] T035 [US5] Reescribir `frontend/src/components/cocina/PedidoCard.tsx` (folio grande, espera, urgencia, CTA único)
- [x] T036 [US5] Reescribir `frontend/src/pages/cocina/Cocina.tsx` (agrupación por estado, polling, contadores, estados vacío/error/conflicto)

### Phase 11: Cliente (US6)

- [x] T037 [US6] Crear `frontend/src/lib/carrito.tsx` (`CarritoProvider`, `useCarrito`, persistencia `cafe-itsh-carrito`) y montarlo en `App.tsx`
- [x] T038 [US6] Rediseñar `frontend/src/pages/clientes/Menu.tsx` y `components/menu/PlatilloCard.tsx` (buscador, chips, steppers, botón flotante)
- [x] T039 [US6] Reescribir `components/clientes/Carrito.tsx` con contexto; limpiar carrito en `pages/clientes/Carrito.tsx` y `Pago.tsx`; mostrar `fechaRecoleccion` en `MisPedidos.tsx` y `PedidoDetalle.tsx`

### Phase 12: Administración (US7)

- [x] T040 [US7] Crear `frontend/src/pages/admin/Inicio.tsx` (conteos con `useQuery(['usuarios'])`, `usePlatillos`, `useMenu`) y actualizar `router.tsx` (`/admin` → Inicio)
- [x] T041 [P] [US7] Añadir búsqueda/chips a `pages/admin/Platillos.tsx` y mover el formulario de `pages/admin/Usuarios.tsx` a `PanelLateral` con CTA "Nuevo usuario"

### Phase 13: Pruebas y verificación de la extensión

- [x] T042 [P] Actualizar `frontend/tests/Caja.test.tsx` y `PedidoMostrador.test.tsx` al flujo por pasos y etiquetas nuevas
- [x] T043 [P] Actualizar `frontend/tests/Menu.test.tsx` y `Carrito.test.tsx` a buscador/chips/stepper y `CarritoProvider`
- [x] T044 Ajustar `eslint.config.js` (`allowExportNames: ['useCarrito']`) y eliminar el `useEffect` de cambio de ruta en `LayoutModulo` (regla `set-state-in-effect`)
- [x] T045 Ejecutar `npm.cmd run typecheck`, `npm.cmd test -- --run` (11 archivos, 35 pruebas), `npm.cmd run lint` y `npm.cmd run build`
- [x] T046 Confirmar trazabilidad US4→FR-009/010, US5→FR-011, US6→FR-012/013, US7→FR-014 y SC-006…SC-009

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — bloquea todas las historias
- **User Stories (Phases 3–5)**: dependen de Foundational; US1 (P1) es el MVP; US2 (P2) y
  US3 (P3) son incrementales y siguen a US1
- **Polish (Phase 6)**: depende de las historias deseadas
- **Extensión (Phases 7–13)**: depende de los tokens (US1-US3); navegación (7) bloquea las
  pantallas; UI compartida (8) bloquea caja/cocina/cliente/admin; pruebas (13) al final

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
- La extensión sí toca `router.tsx` (solo `/admin` → Inicio) y añade `src/lib/carrito.tsx`;
  no toca `backend/` ni `database/`
- La paleta por defecto de Tailwind se mantiene (solo se añaden tokens) para no romper
  pantallas no migradas
- Sin dependencias npm nuevas (§22)
- Las rutas de la extensión son las mismas; sólo cambia la landing de `/admin`
- Commit tras cada tarea o grupo lógico
