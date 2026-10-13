# Implementation Plan: Fundación y autenticación (Sprint 1)

**Branch**: `002-foundation-auth` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-foundation-auth/spec.md`

## Summary

Establecer la base técnica y de seguridad del sistema: esquema y migraciones de `rol` y
`usuario`, autenticación con correo/contraseña (JWT + bcrypt), autorización por rol,
endpoints de registro/login/sesión, administración de usuarios operativos por el
administrador, y el esqueleto del frontend (app única React con rutas protegidas por rol).
Es la fundación que desbloquea el resto de los sprints.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS (22.x) en backend; TypeScript 5.x +
React 18/19 con Vite en frontend.

**Primary Dependencies**: Backend — Express 4, `mysql2`, `jsonwebtoken`, `bcryptjs`, `zod`,
`dotenv`, `cors`, `cookie-parser`. Frontend — `react-router-dom`, `@tanstack/react-query`,
`axios`, `tailwindcss`, `shadcn/ui`, `react-hook-form` + `zod`.

**Storage**: MySQL 8.0+ (acceso con `mysql2/promise`, SQL parametrizado, sin ORM).

**Testing**: Vitest en ambas capas; `supertest` para endpoints del backend; React Testing
Library + jsdom para el frontend.

**Target Platform**: Aplicación web (navegadores modernos) con backend Node en servidor.

**Project Type**: Web application (frontend + backend separados).

**Performance Goals**: Inicio de sesión percibido en menos de 1 s; el guard de rutas no debe
bloquear la navegación. Criterios de negocio en `spec.md`.

**Constraints**: Contraseñas nunca en texto plano ni en el código; secretos sólo por variables
de entorno; sin stack traces al usuario; TypeScript estricto.

**Scale/Scope**: ~4 roles, decenas de usuarios; 5 rutas de frontend y ~7 endpoints en este
sprint.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | `strict: true` en ambos proyectos |
| II. App web única por roles (JWT + rol) | PASS | SPA única con rutas `/admin`, `/caja`, `/cocina`, `/menu`, `/mis-pedidos` |
| III. API REST sobre Express simple | PASS | `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/` |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza `rol`/`usuario`; `mysql2` sin ORM |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | JWT + bcrypt + autorización por rol + secretos en entorno |
| VI. Flujo de pedidos anticipados/mostrador | PASS (n/a) | Fuera de alcance; no lo contradice |
| VII. Validación, errores y secretos | PASS | `zod`, manejador central de errores, `.env` |
| VIII. Vitest y simplicidad del MVP | PASS | Vitest/supertest/RTL; sin capas extra |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-foundation-auth/
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
│   ├── config/db.ts                  # Pool mysql2 + lectura de .env
│   ├── db/migrate.ts                 # Runner de migraciones SQL
│   ├── middlewares/
│   │   ├── requireAuth.ts
│   │   ├── requireRole.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── usuarios.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── usuarios.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── usuarios.service.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── errors.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── auth.test.ts
│   └── usuarios.test.ts
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts                    # Cliente axios (withCredentials)
│   │   └── auth.tsx                  # AuthProvider + useAuth
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/                       # componentes shadcn/ui
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── admin/AdminLayout.tsx
│   │   ├── admin/Usuarios.tsx
│   │   ├── caja/CajaLayout.tsx
│   │   ├── cocina/CocinaLayout.tsx
│   │   └── clientes/ClientesLayout.tsx
│   ├── router.tsx
│   ├── App.tsx
│   └── main.tsx
└── tests/
    └── ProtectedRoute.test.tsx

database/
└── migrations/
    ├── 001_crear_esquema.sql         # ya existe (mover desde migrations/)
    └── 002_seed_inicial.sql          # ya existe (mover desde migrations/)
```

**Structure Decision**: Web application (frontend + backend) conforme a la constitución §17.
La carpeta existente `migrations/` (raíz del repo spec-kit) se reubica en `database/migrations/`
para alinear con la estructura constitucional; el runner de migraciones lee esa carpeta.

## Complexity Tracking

Sin violaciones; no aplica.
