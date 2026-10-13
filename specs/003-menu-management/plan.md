# Implementation Plan: Gestión y consulta del menú (Sprint 2)

**Branch**: `003-menu-management` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-menu-management/spec.md`

## Summary

Permitir que el administrador publique y mantenga el menú del día (platillos, precios,
disponibilidad y especiales) y que los clientes (alumno/docente) consulten ese menú de forma
rápida y responsiva. Se construye sobre el esquema existente (`platillo`, `menu_dia`) y la
infraestructura de autenticación/autorización del Sprint 1 (middlewares `requireAuth` /
`requireRole('administrador')`). Subconjunto de la spec maestra
`specs/001-advance-order-system/spec.md` (US7 + US1).

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS (22.x) en backend; TypeScript 5.x +
React 18/19 con Vite en frontend.

**Primary Dependencies**: Backend — Express 4, `mysql2`, `zod`, `dotenv`, `cors`,
`cookie-parser`, `jsonwebtoken` (reutilizadas del Sprint 1). Frontend — `react-router-dom`,
`@tanstack/react-query`, `axios`, `tailwindcss`, `shadcn/ui`, `react-hook-form` + `zod`
(reutilizadas del Sprint 1). Sin dependencias nuevas (constitución §8/§20).

**Storage**: MySQL 8.0+ (acceso con `mysql2/promise`, SQL parametrizado, sin ORM). Reutiliza
`database/migrations/001_crear_esquema.sql` (`platillo`, `menu_dia`) y `002_seed_inicial.sql`;
no requiere nuevas migraciones, salvo un seed opcional de platillos de ejemplo.

**Testing**: Vitest en ambas capas; `supertest` para los endpoints del backend; React Testing
Library + jsdom para el frontend.

**Target Platform**: Aplicación web (navegadores modernos) con backend Node en servidor.

**Project Type**: Web application (frontend + backend separados).

**Performance Goals**: La consulta del menú del día debe ser percibida como inmediata, incluso
en horario de receso desde el móvil (SC-003); una sola consulta por fecha sirve la vista.

**Constraints**: TypeScript estricto; sin stack traces al usuario; los cambios publicados deben
reflejarse de inmediato (sin caché que los retrase más allá de lo aceptable); precios válidos
(≥ 0).

**Scale/Scope**: Decenas de platillos; ~8 platillos por día; 1 pantalla de administración y 1
pantalla de consulta; ~5 endpoints nuevos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | `strict: true` en backend y frontend; DTOs tipados con `zod` |
| II. App web única por roles (JWT + rol) | PASS | Gestión sólo en `/admin` (rol administrador); consulta en `/menu` |
| III. API REST sobre Express simple | PASS | `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`; métodos HTTP por propósito |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza `platillo` y `menu_dia`; `mysql2` sin ORM; SQL parametrizado |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | `requireRole('administrador')` en la gestión; consulta autenticada |
| VI. Flujo de pedidos anticipados y de mostrador | PASS (n/a) | Habilita el menú sobre el que se pedirá; no contradice |
| VII. Validación, errores y secretos | PASS | `zod`; `errorHandler` uniforme; secretos en entorno |
| VIII. Vitest y simplicidad del MVP | PASS | Vitest/supertest/RTL; sin dependencias nuevas; consulta optimizada |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-menu-management/
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
│   │   ├── platillos.routes.ts         # NUEVO — /platillos
│   │   └── menu.routes.ts              # NUEVO — /menu
│   ├── controllers/
│   │   ├── platillos.controller.ts     # NUEVO
│   │   └── menu.controller.ts          # NUEVO
│   ├── services/
│   │   ├── platillos.service.ts        # NUEVO — CRUD del catálogo
│   │   └── menu.service.ts             # NUEVO — menú por fecha, precios, disponibilidad, especiales
│   ├── utils/
│   │   ├── jwt.ts / password.ts / errors.ts        # (Sprint 1)
│   │   └── schemas/{platillos,menu}.schema.ts      # NUEVO — esquemas zod
│   ├── app.ts                          # (Sprint 1) — monta platillos.routes.ts y menu.routes.ts
│   └── server.ts                       # (Sprint 1)
├── tests/
│   ├── platillos.test.ts               # NUEVO — US1
│   └── menu.test.ts                    # NUEVO — US1/US2
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts                      # Cliente axios (Sprint 1)
│   │   ├── auth.tsx                    # AuthProvider + useAuth (Sprint 1)
│   │   └── menu.ts                     # NUEVO — hooks TanStack Query
│   ├── components/
│   │   ├── ProtectedRoute.tsx          # (Sprint 1)
│   │   ├── ui/                         # componentes shadcn/ui (Sprint 1)
│   │   ├── menu/PlatilloForm.tsx       # NUEVO — alta/edición de platillo
│   │   └── menu/PlatilloCard.tsx       # NUEVO — tarjeta de menú (cliente)
│   ├── pages/
│   │   ├── Login.tsx                   # (Sprint 1)
│   │   ├── admin/AdminLayout.tsx       # (Sprint 1)
│   │   ├── admin/Platillos.tsx         # NUEVO — gestión de platillos
│   │   ├── admin/Menu.tsx              # NUEVO — menú del día, precios, disponibilidad, especiales
│   │   ├── caja/CajaLayout.tsx         # (Sprint 1)
│   │   ├── cocina/CocinaLayout.tsx     # (Sprint 1)
│   │   └── clientes/Menu.tsx           # NUEVO — consulta del menú (/menu)
│   ├── router.tsx                      # (Sprint 1) — añade rutas admin/menu
│   ├── App.tsx
│   └── main.tsx
└── tests/
    ├── ProtectedRoute.test.tsx         # (Sprint 1)
    └── Menu.test.tsx                   # NUEVO — consulta y no disponibles

database/
└── migrations/
    ├── 001_crear_esquema.sql           # ya existe — platillo, menu_dia
    └── 002_seed_inicial.sql            # ya existe — platillos y menú de ejemplo
```

**Structure Decision**: Web application (frontend + backend) conforme a la constitución §17. Se
reutiliza la infraestructura del Sprint 1 y el esquema existente; la feature sólo agrega los
módulos de catálogo/menú en ambos proyectos.

## Complexity Tracking

Sin violaciones; no aplica.
