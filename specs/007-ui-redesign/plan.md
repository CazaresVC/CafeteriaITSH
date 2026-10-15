# Implementation Plan: Tokens de diseño (DESIGN.md) en el frontend

**Branch**: `007-ui-redesign` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

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

**Constraints**: No modificar navegación, rutas, `lib/*`, `router.tsx` ni backend; conservar
la API pública de los componentes `ui/*`; mantener la coexistencia de utilidades de color
existentes para no romper pantallas no migradas; respetar §II/§19 (responsiva, ≥ 44 px, alto
contraste).

**Scale/Scope**: ~8 archivos del frontend; 1 archivo de tema, 4 componentes base, 1 layout, 2
mapas de color de estado. Sin endpoints, sin migraciones, sin entidades nuevas.

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
├── research.md          # Fase 0: decisiones de tokens y fuentes
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
│   │   ├── LayoutModulo.tsx            # encabezado/superficies con tokens (sin cambiar navegación)
│   │   ├── ui/
│   │   │   ├── button.tsx              # variantes → tokens (primary/secondary/ghost/danger)
│   │   │   ├── card.tsx                # superficies, borde y radios de token
│   │   │   ├── input.tsx               # borde, foco y superficies de token
│   │   │   └── label.tsx               # color de texto de token
│   │   ├── cocina/
│   │   │   └── PedidoCard.tsx          # COLOR_ESTADO → tokens status-*
│   │   └── clientes/
│   │       └── (sin cambios de estructura)
│   ├── pages/
│   │   └── clientes/
│   │       └── MisPedidos.tsx          # COLOR_ESTADO → tokens status-*
│   └── (sin cambios en router.tsx ni lib/*)
└── .
```

**Structure Decision**: Solo frontend, conforme a la constitución §17 (`src/components`,
`src/pages`). Los tokens viven en un único lugar (`src/index.css`, bloque `@theme`) y se
consumen desde los componentes base y el tema global; ningún archivo de `backend/`,
`database/` o de la lógica de frontend (`src/lib/`, `src/router.tsx`) se modifica.

## Complexity Tracking

Sin violaciones; no aplica.
