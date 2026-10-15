# Implementation Plan: Republicar el menú del día en un clic

**Branch**: `008-republicar-menu` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-republicar-menu/spec.md`

## Summary

Añadir la capacidad de **republicar el menú del día** para el rol administrador: un endpoint
`POST /api/menu/republicar` que copia el menú de la fecha publicada más reciente a la fecha
destino (por defecto hoy), omitiendo platillos inactivos y duplicados (idempotente), y que
responde `{ fecha, origen, agregados, omitidos }`. En el frontend, la consola `/admin/menu` gana
una sección **Republicar** ligada a la fecha seleccionada, con confirmación del resultado y
mensajes de error claros, coherente con el sistema de diseño. No se introducen dependencias
nuevas, no se cambian roles ni flujos de pedidos existentes, y se añaden pruebas de la lógica
crítica.

## Technical Context

**Language/Version**: TypeScript 5.7 — backend Node/Express 4 (CommonJS) + frontend React 19 con
Vite 8.

**Primary Dependencies**: Ya presentes — backend: Express 4, `mysql2/promise` (SQL
parametrizado), `zod`; frontend: `@tanstack/react-query` 5, `axios`, Tailwind v4. **Sin
dependencias nuevas** (§22).

**Storage**: MySQL `menu_dia` (fila `(fecha, platillo_id, precio, disponible, especial)`, única
por `(fecha, platillo_id)`). No se modifican migraciones ni el esquema.

**Testing**: Backend Vitest con mock de `../src/config/db` (`query`/`conTransaccion`) siguiendo el
patrón `vi.hoisted` + `vi.mock`; frontend Vitest (`vite.config.ts`, jsdom) + React Testing
Library. Se añaden pruebas del endpoint (éxito, idempotencia/default, 404, 400, 403).

**Target Platform**: Servidor Node (API REST) + navegadores modernos (SPA responsiva, solo modo
claro).

**Project Type**: Web application (backend + frontend separados).

**Performance Goals**: La copia es un único `INSERT ... SELECT`; sin bucles por ítem; sin impacto
medible en latencia.

**Constraints**: Respuestas **camelCase**; errores con cuerpo uniforme `{ error: { codigo,
mensaje } }`; conservar la API pública de servicios/componentes existentes; no tocar el esquema
ni el flujo de pedidos; UI ≥ 44 px de área táctil y alto contraste.

**Scale/Scope**: 1 endpoint nuevo, 1 función de servicio, 1 hook de frontend y 1 sección de UI;
~6 archivos tocados (3 backend, 2 frontend + 1 test). Sin migraciones ni entidades nuevas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | Tipos `ResultadoRepublicacion` en backend y frontend; `tsc` limpio |
| II. App web única por roles (JWT + rol) | PASS | La acción es solo `administrador`; se respeta la navegación por rol |
| III. API REST sobre Express simple | PASS | Ruta nueva bajo `/api/menu`, misma estructura de capas (ruta→controlador→servicio) |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza `menu_dia`; sin cambios de esquema |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | `requireRole('administrador')` en la ruta nueva |
| VI. Flujo de pedidos anticipados/mostrador | PASS | No altera la máquina de estados ni los pedidos |
| VII. Validación, errores y secretos | PASS | Validación con `zod`; errores con cuerpo uniforme; sin secretos |
| VIII. Vitest y simplicidad del MVP | PASS | Sin dependencias nuevas; pruebas de la lógica crítica; alcance acotado |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/008-republicar-menu/
├── spec.md              # Especificación (/speckit-specify)
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0: decisiones (fuente de la copia, idempotencia, UI)
├── data-model.md        # Reutilización de menu_dia y resultado de la operación
├── quickstart.md        # Fase 1: validación manual y de comandos
├── contracts/
│   └── openapi.yaml     # Contrato del endpoint de republicación
├── checklists/
│   └── requirements.md  # Calidad de la spec
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── routes/menu.routes.ts             # + POST /republicar (admin), antes de /:id
│   ├── controllers/menu.controller.ts    # + republicar (fecha por defecto = hoy)
│   ├── services/menu.service.ts          # + republicar() (INSERT ... SELECT idempotente)
│   ├── utils/schemas/menu.schema.ts      # + menuRepublicarSchema ({ fecha? })
│   └── tipos.ts                          # + ResultadoRepublicacion
└── tests/menu.test.ts                    # + describe de republicar (éxito/default/404/400/403)

frontend/
├── src/
│   ├── lib/menu.ts                       # + useRepublicarMenu() y ResultadoRepublicacion
│   └── pages/admin/Menu.tsx              # + sección "Republicar" con aviso y errores
```

**Structure Decision**: La capacidad se implementa en las capas existentes (ruta→controlador→
servicio) con `zod`, siguiendo la convención del backend CommonJS; el frontend añade un hook de
React Query y una sección en la consola de admin. No se crean servicios ni páginas nuevas que
dupliquen responsabilidades.

## Complexity Tracking

Sin violaciones; no aplica.
