# Implementation Plan: Tokens de diseño y rediseño de navegación/pantallas por rol

**Branch**: `007-ui-redesign` | **Date**: 2026-10-14 (extensión 2026-11-02) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-ui-redesign/spec.md`

## Summary

Aplicar el sistema de diseño canónico `Docs/DESIGN.md` al frontend como **tokens nativos de
Tailwind v4** definidos en `frontend/src/index.css` mediante un bloque `@theme` (colores,
tipografía, radios y espaciado), y hacer que el tema global y los componentes base
(`ui/button`, `ui/card`, `ui/input`, `ui/label`), el encabezado de `LayoutModulo` y las
insignias de estado de pedido los consuman. La funcionalidad es **de presentación y
aditiva**: no cambia navegación, rutas, lógica de negocio, permisos ni endpoints, no
introduce dependencias npm y no toca `backend/` ni `database/`. Es el pulido de UI del
Sprint 5 acotado estrictamente a los tokens, como paso previo (y separado) de cualquier
rediseño de navegación o de pantallas.

**Extensión CFITSH-25…29 (2026-11-02)**: sobre esa base se reemplaza la navegación por
drawer móvil + panel fijo en escritorio (bottom bar en caja y cliente) y se rediseñan caja
(flujo en pasos), cocina (KDS agrupado), cliente (menú/carrito persistente/pago/mis pedidos)
y administración (landing con conteos). Se conservan rutas, `ProtectedRoute`, hooks de datos,
endpoints y backend; no se añaden dependencias. Decisiones en `research.md` y validación en
`quickstart.md`.

## Technical Context

**Language/Version**: TypeScript 5.7 sobre React 19 con Vite 8 (solo frontend).

**Primary Dependencies**: Ya presentes — `tailwindcss` v4 + `@tailwindcss/vite`, `react-router-dom`
7, `@tanstack/react-query` 5, `axios`, `clsx`, `tailwind-merge`. **Sin dependencias nuevas**
(§22). Los tokens se declaran con el bloque `@theme` de Tailwind v4; no se requiere
`tailwind.config.js`.

**Storage**: N/A — funcionalidad de presentación; no accede a base de datos.

**Testing**: Vitest (config dentro de `vite.config.ts`, `globals: true`, jsdom) + React Testing
Library. Pruebas existentes del frontend deben seguir en verde; se añade como máximo una
prueba de no regresión de la apariencia/API de los componentes base si aporta valor.

**Target Platform**: Navegadores modernos (aplicación web responsiva); solo modo claro.

**Project Type**: Web application (frontend + backend separados); esta funcionalidad toca
únicamente `frontend/`.

**Performance Goals**: Sin impacto medible; el CSS de tokens se compila en build y no añade
peticiones en tiempo de ejecución salvo, opcionalmente, una hoja de fuentes web con respaldo
local.

**Constraints**: Conservar rutas, `ProtectedRoute`, hooks de datos y backend; la extensión sí
puede cambiar la navegación visual y la estructura de las pantallas. Mantener la API pública
de los componentes `ui/*`, la coexistencia de utilidades de color existentes y §II/§19
(responsiva, ≥ 44 px, alto contraste). Sin dependencias npm nuevas.

**Scale/Scope**: Tokens (~8 archivos) + extensión (~35 archivos del frontend: 4 layouts, 4
componentes de layout, 4 UI compartidas, carrito, ~12 pantallas/componentes y 4 pruebas). Sin
endpoints, sin migraciones, sin entidades nuevas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | Solo cambios de clases/tokens; `tsc --noEmit` debe seguir limpio |
| II. App web única por roles (JWT + rol) | PASS | No se tocan rutas ni guardas; se conserva la navegación por rol y el área táctil ≥ 44 px |
| III. API REST sobre Express simple | PASS | N/A: sin cambios de API ni backend |
| IV. MySQL 8.0+ relacional | PASS | N/A: sin cambios de datos |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | Sin cambios de autenticación/autorización |
| VI. Flujo de pedidos anticipados/mostrador | PASS | Sin cambios de flujo; solo color de las insignias de estado |
| VII. Validación, errores y secretos | PASS | N/A: sin validación, red ni secretos |
| VIII. Vitest y simplicidad del MVP | PASS | Sin dependencias nuevas; pruebas existentes en verde; sin funcionalidad fuera de alcance |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/007-ui-redesign/
├── spec.md              # Especificación (/speckit-specify)
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0: decisiones de tokens, navegación, caja, KDS y carrito
├── data-model.md        # N/A: sin entidades de datos
├── quickstart.md        # Fase 1: validación visual y de comandos
├── checklists/
│   └── requirements.md  # Calidad de la spec
└── tasks.md             # /speckit-tasks
```

*(No se incluye `contracts/openapi.yaml`: la funcionalidad no expone ni modifica API.)*

### Source Code (repository root)

```text
frontend/
├── index.html                          # (opcional) enlace a fuentes web con respaldo local
├── src/
│   ├── index.css                       # @theme con los tokens de Docs/DESIGN.md + tema global
│   ├── components/
│   │   ├── LayoutModulo.tsx            # tokens + shell de navegación (extensión)
│   │   ├── ui/
│   │   │   ├── button.tsx              # variantes → tokens (primary/secondary/ghost/danger)
│   │   │   ├── card.tsx                # superficies, borde y radios de token
│   │   │   ├── input.tsx               # borde, foco y superficies de token
│   │   │   └── label.tsx               # color de texto de token
│   │   ├── cocina/
│   │   │   └── PedidoCard.tsx          # KDS + tokens status-*
│   │   └── clientes/
│   │       └── Carrito.tsx             # carrito desde contexto (extensión)
│   ├── pages/
│   │   ├── clientes/
│   │   │   └── MisPedidos.tsx          # COLOR_ESTADO → tokens status-*
│   │   ├── admin/                      # + Inicio.tsx (extensión)
│   │   ├── caja/                       # flujo por pasos (extensión)
│   │   └── cocina/                     # KDS agrupado (extensión)
│   ├── lib/carrito.tsx                 # contexto + localStorage (extensión)
│   └── router.tsx                      # /admin → Inicio (extensión)
└── .
```

**Structure Decision**: Solo frontend, conforme a la constitución §17 (`src/components`,
`src/pages`). Los tokens viven en un único lugar (`src/index.css`, bloque `@theme`) y se
consumen desde los componentes base y el tema global. La extensión añade `lib/carrito.tsx` y
ajusta `router.tsx` sólo para la landing de `/admin`; no modifica `backend/` ni `database/`.

## Extensión CFITSH-25…29 — estructura

```text
frontend/src/
├── components/
│   ├── LayoutModulo.tsx            # shell: sidebar fijo, header, drawer, bottom bar
│   ├── layout/                     # tipos.ts, activo.ts, DrawerLateral.tsx, BarraInferior.tsx
│   ├── ui/                         # + buscador, chips-categoria, boton-flotante-cobro, panel-lateral
│   ├── caja/PedidoMostrador.tsx    # búsqueda, chips, stepper, resumen y total
│   ├── cocina/PedidoCard.tsx       # KDS: folio, espera, CTA único
│   ├── clientes/Carrito.tsx        # carrito desde contexto
│   └── menu/PlatilloCard.tsx       # stepper de cantidad
├── lib/carrito.tsx                 # CarritoProvider + localStorage
├── pages/
│   ├── admin/                      # AdminLayout, Inicio (nuevo), Usuarios, Platillos, Menu
│   ├── caja/                       # CajaLayout, Caja (pasos), Entregas
│   ├── cocina/                     # CocinaLayout, Cocina (agrupada)
│   └── clientes/                   # ClientesLayout, Menu, Carrito, Pago, MisPedidos, PedidoDetalle
├── router.tsx                      # /admin → Inicio (sin rutas nuevas)
└── eslint.config.js                # override allowExportNames para useCarrito
```

## Complexity Tracking

Sin violaciones; no aplica. La extensión no añade dependencias ni toca backend/base de datos;
la persistencia del carrito es del lado cliente y se valida contra el menú vigente.
