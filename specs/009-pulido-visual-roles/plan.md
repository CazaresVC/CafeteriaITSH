# Implementation Plan: Pulido visual por rol

**Branch**: `009-pulido-visual-roles` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-pulido-visual-roles/spec.md`

## Summary

Elevar el atractivo y la coherencia visual de los cuatro roles con componentes de presentación
reutilizables y pequeñas mejoras de rol que solo usan endpoints existentes: **vista Entregas** de
caja (`GET /pedidos?estado=Listo`, `PATCH /pedidos/:id/estado`) y **Editar usuario** en admin
(`PATCH /usuarios/:id`). No se toca el backend, el esquema ni las dependencias, ni se rediseña la
navegación (se conservan los tabs; solo se añade `/caja/entregas`).

## Technical Context

**Language/Version**: TypeScript 5.7 — React 19 + Vite 8, ESM.

**Primary Dependencies**: Ya presentes — react-router 7, TanStack Query 5, axios, Tailwind v4,
`clsx`/`tailwind-merge`. **Sin dependencias nuevas** (§22).

**Storage**: N/A (frontend). Se consumen endpoints existentes.

**Testing**: Vitest + React Testing Library (config en `vite.config.ts`, jsdom, `globals: true`).
Se conservan los 26 tests; se añade cobertura ligera de la vista Entregas.

**Target Platform**: Navegadores modernos (SPA responsiva, solo modo claro).

**Project Type**: Web (frontend).

**Constraints**: Solo tokens de `Docs/DESIGN.md`; áreas táctiles ≥ 44 px; respuestas camelCase
intactas; sin cambios en backend; no romper textos que los tests asertan.

**Scale/Scope**: ~7 componentes nuevos y ~14 archivos de página/layout tocados; 1 ruta nueva.

## Constitution Check

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto | PASS | Componentes tipados; `tsc` limpio |
| II. App única por roles | PASS | No cambian rutas ni permisos; solo presentación |
| III. API REST simple | PASS | No se añaden endpoints |
| IV. MySQL relacional | PASS | Sin cambios de datos |
| V. Seguridad/roles | PASS | Se respetan `requireRole`; Entregas usa las mismas transiciones |
| VI. Flujo de pedidos | PASS | Se conservan las reglas; se delega en el backend |
| VII. Validación/errores | PASS | Errores con cuerpo uniforme (sin cambios) |
| VIII. Vitest y MVP | PASS | Sin deps nuevas; pruebas de lógica crítica |

Sin violaciones.

## Project Structure

### Documentation

```text
specs/009-pulido-visual-roles/
├── spec.md
├── plan.md
├── research.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (frontend)

```text
frontend/src/
├── components/
│   ├── ui/badge.tsx            # + Badge/Chip
│   ├── ui/empty-state.tsx      # + EmptyState (ilustración SVG)
│   ├── ui/stat-card.tsx        # + StatCard
│   ├── ui/stepper.tsx          # + Stepper (reutilizable)
│   ├── ui/page-header.tsx      # + PageHeader
│   ├── ui/confirm-dialog.tsx   # + ConfirmDialog
│   ├── iconos.tsx              # + set de iconos SVG
│   ├── LayoutModulo.tsx        # header + perfil (misma API)
│   ├── menu/PlatilloCard.tsx   # tarjetas atractivas
│   ├── cocina/PedidoCard.tsx   # folio/tiempo destacados
│   ├── caja/PedidoMostrador.tsx# Stepper, filas ≥56px, total stat-lg
│   └── clientes/Carrito.tsx    # Stepper, total stat-lg
├── pages/
│   ├── admin/{Usuarios,Platillos,Menu}.tsx
│   ├── caja/{CajaLayout,Caja}.tsx
│   ├── caja/Entregas.tsx       # + vista Entregas
│   ├── cocina/Cocina.tsx
│   └── clientes/{Menu,Carrito,Pago,MisPedidos,PedidoDetalle}.tsx
└── router.tsx                  # + /caja/entregas
```

**Structure Decision**: Componentes de presentación en `components/ui/`; la vista Entregas es una
página de caja. Se reutilizan hooks (`usePedidos`, `useCambiarEstado`, `useMenu`, `useUsuarios`)
sin cambiarlos.

## Complexity Tracking

Sin violaciones; no aplica.
