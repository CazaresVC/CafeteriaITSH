# Implementation Plan: Pedido anticipado y pago (Sprint 3)

**Branch**: `004-advance-orders-payment` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-advance-orders-payment/spec.md`

## Summary

Permitir que un cliente (alumno/docente) arme un pedido anticipado seleccionando platillos
disponibles del menú del día, lo confirme y lo pague en línea, dejándolo en estado `Pagado`
listo para cocina. El sistema valida la ventana de pedido anticipado, congela el precio de cada
línea, calcula el total, genera un folio, registra el intento de pago y, al confirmarse, avanza el
pedido `Pendiente → Pagado` usando la tabla `transicion_estado`. Subconjunto de la spec maestra
`specs/001-advance-order-system/spec.md` (US2), cubre FR-015…FR-020 y FR-028…FR-030.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS (22.x) en backend; TypeScript 5.x +
React 18/19 con Vite en frontend.

**Primary Dependencies**: Backend — Express 4, `mysql2`, `jsonwebtoken`, `zod`, `dotenv`,
`cors`, `cookie-parser` (reutilizadas del Sprint 1). Frontend — `react-router-dom`,
`@tanstack/react-query`, `axios`, `tailwindcss`, `shadcn/ui`, `react-hook-form` + `zod`
(reutilizadas del Sprint 1). Sin dependencias nuevas (constitución §8/§20).

**Storage**: MySQL 8.0+ (`mysql2/promise`, SQL parametrizado, sin ORM). Reutiliza
`database/migrations/001_crear_esquema.sql` (`pedido`, `pedido_detalle`, `pago`,
`estado_pedido`, `transicion_estado`, `pedido_estado_historial`) y `002_seed_inicial.sql`
(estados `Pendiente`, `Pagado` y transición `Pendiente → Pagado`). No requiere migraciones
nuevas.

**Testing**: Vitest en ambas capas; `supertest` para endpoints; React Testing Library + jsdom
para el frontend.

**Target Platform**: Aplicación web (navegadores modernos) con backend Node en servidor.

**Project Type**: Web application (frontend + backend separados).

**Performance Goals**: Confirmar un pedido anticipado debe ser ágil y no exceder la ventana de
pedido anticipado; el total debe ser determinista y auditable.

**Constraints**: TypeScript estricto; sin stack traces al usuario; precios congelados al crear
el pedido; total calculado en el backend (fuente de verdad); sin pasarela real en el MVP
(integración simulada/abstracta).

**Scale/Scope**: Decenas de pedidos por horario de receso; 1 pantalla de cliente; ~3 endpoints
nuevos; ~6 tablas del esquema existente reutilizadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | `strict: true` en backend y frontend; DTOs tipados con `zod` |
| II. App web única por roles (JWT + rol) | PASS | Pedido disponible para rol `usuario`; pedido atribuido a `usuario.id` de la sesión |
| III. API REST sobre Express simple | PASS | `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`; métodos HTTP por propósito |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza `pedido`, `pedido_detalle`, `pago`; `mysql2` sin ORM; SQL parametrizado |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | `requireRole('usuario')`; el cliente sólo opera sobre sus propios pedidos |
| VI. Flujo de pedidos anticipados y de mostrador | PASS | Núcleo del sprint: pedido anticipado pagado en línea listo para cocina |
| VII. Validación, errores y secretos | PASS | `zod`; `errorHandler` uniforme; secretos en entorno; validación de ventana y estados |
| VIII. Vitest y simplicidad del MVP | PASS | Vitest/supertest/RTL; pago simulado; sin dependencias nuevas |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-advance-orders-payment/
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
│   ├── config/db.ts                    # Pool mysql2 (Sprint 1)
│   ├── db/migrate.ts                   # Runner de migraciones (Sprint 1)
│   ├── middlewares/                    # requireAuth, requireRole, validate, errorHandler (Sprint 1)
│   ├── routes/
│   │   ├── auth.routes.ts              # (Sprint 1)
│   │   ├── usuarios.routes.ts          # (Sprint 1)
│   │   └── pedidos.routes.ts           # NUEVO — POST /pedidos, POST /pedidos/{id}/pagar, GET /pedidos/{id}
│   ├── controllers/
│   │   └── pedidos.controller.ts       # NUEVO
│   ├── services/
│   │   ├── pedidos.service.ts          # NUEVO — creación y consulta del pedido
│   │   ├── ventana.service.ts          # NUEVO — validación de la ventana de pedido anticipado
│   │   ├── pago.service.ts             # NUEVO — registrar intento y confirmar pago
│   │   └── estado.service.ts           # NUEVO — validar transición Pendiente→Pagado + historial
│   ├── utils/
│   │   ├── jwt.ts / password.ts / errors.ts        # (Sprint 1)
│   │   ├── numero.ts                               # NUEVO — generación de folio
│   │   ├── schemas/pedidos.schema.ts               # NUEVO — esquemas zod de entrada
│   │   └── payment/gateway.ts                      # NUEVO — pasarela abstracta (simulada en MVP)
│   ├── app.ts                          # (Sprint 1) — monta pedidos.routes.ts
│   └── server.ts                       # (Sprint 1)
├── tests/
│   ├── pedidos.test.ts                 # NUEVO — US1
│   └── pago.test.ts                    # NUEVO — US2
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts                      # Cliente axios (Sprint 1)
│   │   ├── auth.tsx                    # AuthProvider + useAuth (Sprint 1)
│   │   └── pedidos.ts                  # NUEVO — hooks TanStack Query (crear, pagar, consultar)
│   ├── components/
│   │   ├── ProtectedRoute.tsx          # (Sprint 1)
│   │   ├── ui/                         # componentes shadcn/ui (Sprint 1)
│   │   └── clientes/Carrito.tsx        # NUEVO — selección y total del pedido
│   ├── pages/
│   │   ├── Login.tsx                   # (Sprint 1)
│   │   ├── admin/, caja/, cocina/      # (Sprint 1)
│   │   └── clientes/
│   │       ├── Menu.tsx                # (Sprint 2)
│   │       ├── Carrito.tsx             # NUEVO — armar y confirmar pedido
│   │       └── Pago.tsx                # NUEVO — confirmación de pago
│   ├── router.tsx                      # (Sprint 1) — añade /pedido y /pedido/pago
│   ├── App.tsx
│   └── main.tsx
└── tests/
    ├── ProtectedRoute.test.tsx         # (Sprint 1)
    └── Carrito.test.tsx                # NUEVO — US1/US2

database/
└── migrations/
    ├── 001_crear_esquema.sql           # ya existe — reutilizada
    └── 002_seed_inicial.sql            # ya existe — estados y transición Pendiente→Pagado
```

**Structure Decision**: Web application (frontend + backend) conforme a la constitución §17. Se
reutiliza la infraestructura del Sprint 1 y el esquema existente; esta feature agrega los
módulos de pedido anticipado y pago.

## Complexity Tracking

Sin violaciones; no aplica.
