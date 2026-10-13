# Implementation Plan: Seguimiento, notificaciones y cierre (Sprint 5)

**Branch**: `006-order-tracking-notifications` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-order-tracking-notifications/spec.md`

## Summary

Cerrar la experiencia anticipada: el cliente consulta el recorrido completo de sus pedidos en
`/mis-pedidos` (lista con estado actual y detalle de platillos, cantidades y total, viendo
únicamente los suyos) y recibe un aviso cuando su pedido pasa a "Listo". El aviso se dispara
mediante un **evento de dominio** emitido en la transición de estado (Sprint 4) y se atiende en
un **módulo de notificaciones separado** de la lógica de pedidos, que persiste en `notificacion`
(`canal`, `estado_envio`, `detalle_error`) con soporte de reintento y **sin corromper el estado
del pedido** si el canal falla. El refresco en vivo es por *polling* con `@tanstack/react-query`.
El sprint cierra con pulido de interfaz conforme a los tokens de diseño, las pruebas críticas
(estados, pagos y permisos) en verde y la demostración del flujo completo.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js LTS (22.x) en backend; TypeScript 5.x +
React 18/19 con Vite en frontend.

**Primary Dependencies**: Backend — Express 4, `mysql2`, `jsonwebtoken`, `bcryptjs`, `zod`,
`dotenv`, `cors`, `cookie-parser`, `events` (EventEmitter nativo). Proveedor externo de
notificación opcional vía `fetch`/HTTPS. Frontend — `react-router-dom`,
`@tanstack/react-query`, `axios`, `tailwindcss`, `shadcn/ui`. Sin dependencias nuevas para el
seguimiento (el *polling* lo aporta TanStack Query).

**Storage**: MySQL 8.0+ (acceso con `mysql2/promise`, SQL parametrizado, sin ORM). La tabla
`notificacion` ya existe en `database/migrations/001_crear_esquema.sql`.

**Testing**: Vitest en ambas capas; `supertest` para endpoints del backend; React Testing
Library + jsdom para el frontend.

**Target Platform**: Aplicación web (navegadores modernos) con backend Node en servidor.

**Project Type**: Web application (frontend + backend separados).

**Performance Goals**: `GET /api/pedidos/mios` y `GET /api/notificaciones/mias` responden en
menos de 500 ms en condiciones normales; el *polling* mantiene el estado visible sin recarga
manual; el disparo de la notificación no añade más de ~200 ms percibidos a la transición a
"Listo" (se ejecuta fuera de la ruta crítica del pedido). Criterios de negocio en `spec.md`.

**Constraints**: El fallo del canal externo MUST NOT corromper el estado del pedido (el aviso
se registra como `fallida` con `detalle_error` y queda para reintento); autorización de
propiedad obligatoria (un cliente solo ve sus pedidos); secretos sólo por variables de entorno
(`NOTIFICATION_API_KEY`); TypeScript estricto; sin ORM.

**Scale/Scope**: ~4 roles; decenas de usuarios y pedidos por receso; 4 endpoints en este sprint
(`GET /pedidos/mios`, `GET /pedidos/{id}`, `GET /notificaciones/mias`,
`PATCH /notificaciones/{id}/vista`) y 2 rutas de frontend (`/mis-pedidos` y su detalle).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|-----------|--------|------|
| I. TypeScript estricto de extremo a extremo | PASS | `strict: true`; DTOs y eventos tipados |
| II. App web única por roles (JWT + rol) | PASS | `/mis-pedidos` protegida con JWT + rol `usuario`; UI responsiva con tokens |
| III. API REST sobre Express simple | PASS | `routes/`, `controllers/`, `services/`, `middlewares/`, `utils/`; métodos HTTP correctos |
| IV. MySQL 8.0+ relacional | PASS | Reutiliza `notificacion`, `pedido`, `pedido_detalle`; `mysql2` sin ORM |
| V. Seguridad JWT y roles (NON-NEGOTIABLE) | PASS | `requireAuth`/`requireRole` + verificación de propiedad del pedido |
| VI. Flujo de pedidos anticipados/mostrador | PASS | Notificación al pasar a "Listo"; módulo separado de pedidos |
| VII. Validación, errores y secretos | PASS | `zod`; `errorHandler` sin trazas; `NOTIFICATION_API_KEY` en entorno |
| VIII. Vitest y simplicidad del MVP | PASS | Pruebas de estados, pagos y permisos; *polling* en lugar de WebSocket/SSE |

Sin violaciones. No se requiere Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/006-order-tracking-notifications/
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
│   ├── config/db.ts
│   ├── db/migrate.ts
│   ├── middlewares/
│   │   ├── requireAuth.ts
│   │   ├── requireRole.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── pedidos.routes.ts            # GET /pedidos/mios, GET /pedidos/{id}
│   │   └── notificaciones.routes.ts     # GET /notificaciones/mias, PATCH /notificaciones/{id}/vista
│   ├── controllers/
│   │   ├── pedidos.controller.ts
│   │   └── notificaciones.controller.ts
│   ├── services/
│   │   ├── pedidos.service.ts           # listado/detalle del cliente (solo dueño)
│   │   ├── eventosPedido.ts             # emitter tipado de eventos de dominio
│   │   ├── notificaciones.service.ts    # persistencia + orquestación + reintento
│   │   └── notificacion.provider.ts     # canal in-app (mínimo) y proveedor externo opcional
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── errors.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── pedidos.mios.test.ts
│   ├── notificaciones.test.ts
│   ├── permisos.test.ts
│   ├── estados.test.ts
│   └── flujo.completo.test.ts
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts                       # cliente axios (withCredentials)
│   │   ├── auth.tsx                     # AuthProvider + useAuth
│   │   ├── pedidos.ts                   # hooks TanStack Query (refetchInterval)
│   │   └── notificaciones.ts            # hooks TanStack Query de avisos
│   ├── components/
│   │   ├── NotificacionBadge.tsx
│   │   └── ui/                          # componentes shadcn/ui
│   ├── pages/
│   │   └── clientes/
│   │       ├── ClientesLayout.tsx
│   │       ├── MisPedidos.tsx           # lista con estado actual
│   │       └── PedidoDetalle.tsx        # platillos, cantidades y total
│   ├── router.tsx
│   └── main.tsx
└── tests/
    └── MisPedidos.test.tsx

database/
└── migrations/
    ├── 001_crear_esquema.sql            # ya existe (tabla notificacion)
    ├── 002_seed_inicial.sql             # ya existe
    └── 003_notificaciones.sql           # nueva: `vista` + índices/unicidad de idempotencia
```

**Structure Decision**: Web application (frontend + backend) conforme a la constitución §17. La
lógica de notificaciones vive en `services/notificaciones.service.ts` +
`services/notificacion.provider.ts`, separada de `services/pedidos.service.ts`; ambas se
comunican por un evento de dominio (`services/eventosPedido.ts`), de modo que la operación del
pedido no depende del envío del aviso. La migración `003_notificaciones.sql` añade
`vista TINYINT(1)` (para `PATCH /notificaciones/{id}/vista`) y refuerza `notificacion` con
índice por `pedido_id` y unicidad `(pedido_id, tipo)` para evitar avisos duplicados.

## Complexity Tracking

Sin violaciones; no aplica.
