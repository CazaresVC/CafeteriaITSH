---
description: "Task list for Pulido visual por rol"
---

# Tasks: Pulido visual por rol

**Input**: Design documents from `/specs/009-pulido-visual-roles/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Se conservan los 26 existentes; se añade cobertura ligera de la vista Entregas.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

- Frontend: `frontend/src/`

---

## Phase 1: Librería visual (Foundational)

- [x] T001 [P] Set de iconos SVG en `frontend/src/components/iconos.tsx`
- [x] T002 [P] `frontend/src/components/ui/badge.tsx` (Badge/Chip)
- [x] T003 [P] `frontend/src/components/ui/empty-state.tsx` (ilustración + mensaje + CTA)
- [x] T004 [P] `frontend/src/components/ui/stat-card.tsx`
- [x] T005 [P] `frontend/src/components/ui/stepper.tsx` (reutilizable, 44 px)
- [x] T006 [P] `frontend/src/components/ui/page-header.tsx`
- [x] T007 [P] `frontend/src/components/ui/confirm-dialog.tsx`

## Phase 2: Layout compartido (US1)

- [x] T008 [US1] Pulir `frontend/src/components/LayoutModulo.tsx` (header, perfil, nav activa, misma API)

## Phase 3: Admin (US1 + US3)

- [x] T009 [US1] `frontend/src/pages/admin/Usuarios.tsx`: PageHeader, tabla, badges, EmptyState, ConfirmDialog
- [x] T010 [US3] Añadir **Editar usuario** vía `PATCH /usuarios/:id` en `frontend/src/pages/admin/Usuarios.tsx`
- [x] T011 [P] [US1] `frontend/src/pages/admin/Platillos.tsx`: PageHeader, badges, EmptyState
- [x] T012 [P] [US1] `frontend/src/pages/admin/Menu.tsx`: PageHeader, resumen con badges, EmptyState

## Phase 4: Caja (US2)

- [x] T013 [US1] `frontend/src/components/caja/PedidoMostrador.tsx`: Stepper, filas ≥56 px, total stat-lg
- [x] T014 [US2] `frontend/src/pages/caja/Entregas.tsx`: lista `Listo` con Entregar/Cancelar + contador
- [x] T015 [US2] `frontend/src/pages/caja/CajaLayout.tsx`: enlace Entregas
- [x] T016 [US2] `frontend/src/router.tsx`: ruta `/caja/entregas`
- [x] T017 [P] [US1] `frontend/src/pages/caja/Caja.tsx`: PageHeader y jerarquía visual

## Phase 5: Cocina (US1)

- [x] T018 [P] [US1] `frontend/src/components/cocina/PedidoCard.tsx`: folio y tiempo destacados
- [x] T019 [P] [US1] `frontend/src/pages/cocina/Cocina.tsx`: PageHeader y EmptyState

## Phase 6: Cliente (US1)

- [x] T020 [P] [US1] `frontend/src/components/menu/PlatilloCard.tsx` y `frontend/src/pages/clientes/Menu.tsx`
- [x] T021 [P] [US1] `frontend/src/components/clientes/Carrito.tsx`: Stepper y total stat-lg
- [x] T022 [P] [US1] `frontend/src/pages/clientes/MisPedidos.tsx`: badges, aviso *¡Listo para recoger!*, EmptyState
- [x] T023 [P] [US1] `frontend/src/pages/clientes/Pago.tsx` y `frontend/src/pages/clientes/PedidoDetalle.tsx`
- [x] T024 [P] [US1] `frontend/src/pages/clientes/Carrito.tsx` (página): jerarquía visual

## Phase 7: Verificación

- [x] T025 Prueba ligera de `Entregas` en `frontend/tests/`
- [x] T026 Ejecutar `typecheck`, `lint`, `test`, `build` en verde (SC-004)
- [x] T027 Confirmar sin deps nuevas y `backend/`/`database/` intactos (SC-005)

---

## Dependencies & Execution Order

- Fase 1 → resto. Fases 2–6 pueden avanzar por rol. Fase 7 al final.

## Notes

- [P] = archivos distintos.
- No romper textos asertados por tests (líneas de pedido como un solo nodo de texto).
- Sin dependencias npm nuevas; sin cambios en backend.
