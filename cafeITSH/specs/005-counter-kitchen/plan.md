# Implementation Plan: Mostrador y cocina (Sprint 4)

**Branch**: `005-counter-kitchen` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-counter-kitchen/spec.md`

## Summary

Habilitar la operación interna del sistema: el cajero captura y cobra pedidos de mostrador
(`tipo='mostrador'`, pago en `efectivo`) que entran a la misma cola de preparación que los
pedidos anticipados, y el cocinero opera una pantalla de cocina (KDS) que lista los pedidos
entrantes de ambos orígenes ordenados por llegada y permite avanzarlos por la máquina de
estados completa (`Pendiente → Pagado → En preparación → Listo → Entregado`, con
`Cancelado` desde cualquier estado previo a `Entregado`). Toda transición se valida contra la
tabla `transicion_estado` y se audita en `pedido_estado_historial`. La pantalla de cocina se
refresca sin recarga manual mediante sondeo con TanStack Query (`refetchInterval`). Es el
subconjunto de la spec maestra `specs/001-advance-order-system/spec.md` (US3 + US4) que cubre
FR-019…FR-025 y FR-031…FR-035.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS (22.x) en backend; TypeScript 5.x +
React 18/19 con Vite en frontend.

**Primary Dependencies**: Backend — Express 4, `mysql2`, `jsonwebtoken`, `zod`, `dotenv`,
`cors`, `cookie-parser` (reutilizadas del Sprint 1). Frontend — `react-router-dom`,
`@tanstack/react-query`, `axios`, `tailwindcss`, `shadcn/ui`, `react-hook-form` + `zod`
(reutilizadas del Sprint 1). Sin dependencias nuevas (constitución §8/§20).

**Storage**: MySQL 8.0+ (acceso con `mysql2/promise`, SQL parametrizado, sin ORM). Reutiliza el
esquema existente `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql`
(`pedido`, `pedido_detalle`, `pago`, `estado_pedido`, `transicion_estado`,
`pedido_estado_historial`); no requiere nuevas migraciones.

**Testing**: Vitest en ambas capas; `supertest` para los endpoints del backend; React Testing
Library + jsdom para el frontend.

**Target Platform**: Aplicación web (navegadores modernos) con backend Node en servidor.

**Project Type**: Web application (frontend + backend separados).

**Performance Goals**: La pantalla de cocina debe reflejar pedidos nuevos y cambios de estado
sin recarga manual (SC-004) con sondeo de ≤ 5 s; el cajero completa captura y cobro con la
menor cantidad de pasos (SC-005, FR-006/FR-024).

**Constraints**: TypeScript estricto; sin stack traces al usuario; botones de caja y cocina con
área táctil ≥ 44 px y alto contraste (constitución §19); sin WebSocket/SSE en el MVP.

**Scale/Scope**: ~1–2 cajeros y ~1–2 cocineros concurrentes; 1 pantalla de caja y 1 KDS; 5
endpoints nuevos; ~6 tablas del esquema existente reutilizadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | `strict: true` en backend y frontend; DTOs tipados con `zod` |
| II. App web única por roles (JWT + rol) | PASS | Rutas `/caja` y `/cocina` protegidas por rol; botones ≥ 44 px y alto contraste (§19) |
| III. API REST sobre Express simple | PASS | `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`; métodos HTTP por propósito |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza el esquema existente; `mysql2` sin ORM; SQL parametrizado |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | `requireRole('cajero'\|'cocinero')`; acciones atribuidas a `usuario.id` de la sesión |
| VI. Flujo de pedidos anticipados y de mostrador | PASS | Núcleo del sprint: operación simultánea de ambos orígenes y estados trazables |
| VII. Validación, errores y secretos | PASS | `zod`; `errorHandler` uniforme; `409` en transiciones inválidas; sin datos sensibles |
| VIII. Vitest y simplicidad del MVP | PASS | Vitest/supertest/RTL; polling en lugar de WebSocket/SSE; sin dependencias nuevas |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/005-counter-kitchen/
├── plan.md              # Este archivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1 (contratos REST)
│   └── openapi.yaml
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/db.ts                  # Pool mysql2 (Sprint 1)
│   ├── db/migrate.ts                 # Runner de migraciones (Sprint 1)
│   ├── middlewares/
│   │   ├── requireAuth.ts            # (Sprint 1)
│   │   ├── requireRole.ts            # (Sprint 1)
│   │   ├── validate.ts               # (Sprint 1)
│   │   └── errorHandler.ts           # (Sprint 1)
│   ├── routes/
│   │   ├── auth.routes.ts            # (Sprint 1)
│   │   ├── usuarios.routes.ts        # (Sprint 1)
│   │   └── pedidos.routes.ts         # NUEVO — /pedidos, /pedidos/mostrador, /pedidos/{id}, /cobro, /estado
│   ├── controllers/
│   │   ├── auth.controller.ts        # (Sprint 1)
│   │   ├── usuarios.controller.ts    # (Sprint 1)
│   │   └── pedidos.controller.ts     # NUEVO
│   ├── services/
│   │   ├── auth.service.ts           # (Sprint 1)
│   │   ├── usuarios.service.ts       # (Sprint 1)
│   │   ├── pedidos.service.ts        # NUEVO — crear mostrador, listar KDS, obtener, transicionar
│   │   ├── pago.service.ts           # NUEVO — registrar cobro en efectivo
│   │   └── estado.service.ts         # NUEVO — máquina de estados + historial
│   ├── utils/
│   │   ├── jwt.ts                    # (Sprint 1)
│   │   ├── password.ts               # (Sprint 1)
│   │   ├── errors.ts                 # (Sprint 1)
│   │   ├── numero.ts                 # NUEVO — generación de folio de pedido
│   │   └── schemas/pedidos.schema.ts # NUEVO — esquemas zod de entrada
│   ├── app.ts                        # (Sprint 1) — monta pedidos.routes.ts
│   └── server.ts                     # (Sprint 1)
├── tests/
│   ├── auth.test.ts                  # (Sprint 1)
│   ├── usuarios.test.ts              # (Sprint 1)
│   ├── mostrador.test.ts             # NUEVO — US1
│   ├── cocina.test.ts                # NUEVO — US2
│   └── transiciones.test.ts          # NUEVO — US3
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts                    # Cliente axios (Sprint 1)
│   │   ├── auth.tsx                  # AuthProvider + useAuth (Sprint 1)
│   │   └── pedidos.ts                # NUEVO — hooks TanStack Query (polling refetchInterval)
│   ├── components/
│   │   ├── ProtectedRoute.tsx        # (Sprint 1)
│   │   ├── ui/                       # componentes shadcn/ui (Sprint 1)
│   │   ├── caja/PedidoMostrador.tsx  # NUEVO — captura y total
│   │   ├── cocina/PedidoCard.tsx     # NUEVO — tarjeta KDS con acciones de estado
│   │   └── BotonEstado.tsx           # NUEVO — botón ≥ 44 px de alto contraste
│   ├── pages/
│   │   ├── Login.tsx                 # (Sprint 1)
│   │   ├── admin/                    # (Sprint 1)
│   │   ├── caja/CajaLayout.tsx       # (Sprint 1)
│   │   ├── caja/Caja.tsx             # NUEVO — captura y cobro de mostrador
│   │   ├── cocina/CocinaLayout.tsx   # (Sprint 1)
│   │   └── cocina/Cocina.tsx         # NUEVO — KDS (ambos orígenes, todos los estados)
│   ├── router.tsx                    # (Sprint 1) — añade rutas /caja y /cocina
│   ├── App.tsx
│   └── main.tsx
└── tests/
    ├── ProtectedRoute.test.tsx       # (Sprint 1)
    ├── Caja.test.tsx                 # NUEVO — US1
    └── Cocina.test.tsx               # NUEVO — US2/US3

database/
└── migrations/
    ├── 001_crear_esquema.sql         # ya existe — se reutiliza
    └── 002_seed_inicial.sql          # ya existe — estados y transiciones sembrados
```

**Structure Decision**: Web application (frontend + backend) conforme a la constitución §17. Se
reutilizan íntegramente la infraestructura del Sprint 1 (`backend/src/{config,db,middlewares,
routes,controllers,services,utils}` y `frontend/src/{lib,components/ui,pages}`); esta feature
solo agrega módulos de pedidos en ambos proyectos y no crea migraciones nuevas porque el
esquema y las transiciones ya existen en `database/migrations/`.

## Complexity Tracking

Sin violaciones; no aplica.
