---
description: "Task list for Fundación y autenticación (Sprint 1)"
---

# Tasks: Fundación y autenticación (Sprint 1)

**Input**: Design documents from `/specs/002-foundation-auth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Incluidos (la constitución §20 exige pruebas de la lógica crítica: autenticación,
autorización y gestión de usuarios).

**Organization**: Tareas agrupadas por historia de usuario para permitir implementación y
prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2 o US3

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y estructura base

- [ ] T001 Crear estructura de carpetas de backend (`backend/src/{config,db,middlewares,routes,controllers,services,utils}`) y frontend (`frontend/src/{lib,components/ui,pages/{admin,caja,cocina,clientes}}`) según plan.md
- [ ] T002 [P] Configurar `backend/package.json` con TypeScript estricto, scripts (`dev`, `build`, `start`, `test`, `migrate`, `typecheck`) y dependencias (`express`, `mysql2`, `jsonwebtoken`, `bcryptjs`, `zod`, `dotenv`, `cors`, `cookie-parser`)
- [ ] T003 [P] Configurar `frontend` con TypeScript estricto, `react-router-dom`, `@tanstack/react-query`, `axios`, Tailwind CSS y shadcn/ui (scripts `dev`, `build`, `test`, `typecheck`)
- [ ] T004 [P] Configurar Vitest en backend (con `supertest`) y en frontend (RTL + jsdom) en `backend/vitest.config.ts` y `frontend/vitest.config.ts`
- [ ] T005 [P] Crear `backend/.env.example` con `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `CORS_ORIGIN` y documentar que `.env` no se versiona

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura que MUST completarse antes de cualquier historia

**⚠️ CRITICAL**: Ninguna historia puede comenzar hasta terminar esta fase

- [ ] T006 Reubicar migraciones a `database/migrations/` (`001_crear_esquema.sql`, `002_seed_inicial.sql`) y crear `003_seed_usuarios.sql` con admin/cajero/cocinero (hashes bcrypt, sólo desarrollo)
- [ ] T007 Implementar pool de conexión MySQL en `backend/src/config/db.ts` (mysql2/promise, `DATABASE_URL`)
- [ ] T008 Implementar runner de migraciones con tabla `migracion_aplicada` en `backend/src/db/migrate.ts` y script `npm run migrate`
- [ ] T009 [P] Implementar utilidades `backend/src/utils/errors.ts` (ErrorDeDominio → HTTP), `backend/src/utils/password.ts` (bcryptjs) y `backend/src/utils/jwt.ts` (firma/verificación HS256)
- [ ] T010 [P] Implementar `backend/src/middlewares/errorHandler.ts` (respuesta uniforme `{ error: { codigo, mensaje } }`, sin stack traces) y `backend/src/middlewares/validate.ts` (zod)
- [ ] T011 Implementar `backend/src/app.ts` (Express, `cookie-parser`, `cors` con credentials) y `backend/src/server.ts`
- [ ] T012 Crear cliente HTTP del frontend en `frontend/src/lib/api.ts` (axios, `baseURL=/api`, `withCredentials: true`) y `AuthProvider`/`useAuth` en `frontend/src/lib/auth.tsx` (consulta `GET /api/auth/me`)

**Checkpoint**: Infraestructura lista — las historias pueden comenzar

---

## Phase 3: User Story 1 - Iniciar sesión y acceder al módulo según el rol (Priority: P1) 🎯 MVP

**Goal**: Login con correo/contraseña, cookie JWT, guard de rutas por rol.

**Independent Test**: Credenciales válidas de cada rol abren su módulo; sin sesión → `/login`;
con otro rol → denegado.

### Tests for User Story 1 ⚠️

- [ ] T013 [P] [US1] Test de integración de login/me/logout en `backend/tests/auth.test.ts` (válido, inválido 401, cookie, `me` sin sesión 401)
- [ ] T014 [P] [US1] Test de `ProtectedRoute` en `frontend/tests/ProtectedRoute.test.tsx` (sin sesión redirige, rol incorrecto deniega, rol correcto renderiza)

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implementar `auth.service.ts` en `backend/src/services/auth.service.ts` (login, `me`, emisión de cookie, verificación de `activo`)
- [ ] T016 [US1] Implementar `auth.controller.ts` y `auth.routes.ts` (`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`) en `backend/src/controllers/` y `backend/src/routes/`
- [ ] T017 [P] [US1] Implementar `backend/src/middlewares/requireAuth.ts` (valida JWT, re-verifica usuario activo) y `requireRole.ts`
- [ ] T018 [US1] Crear `Login.tsx` en `frontend/src/pages/Login.tsx` (react-hook-form + zod, mensaje genérico en error)
- [ ] T019 [US1] Crear `frontend/src/components/ProtectedRoute.tsx` y el `router.tsx` con rutas `/login`, `/admin`, `/caja`, `/cocina`, `/menu`, `/mis-pedidos`
- [ ] T020 [US1] Crear layouts por rol en `frontend/src/pages/{admin,caja,cocina,clientes}/` y `App.tsx`/`main.tsx`

**Checkpoint**: US1 funcional y verificable de forma independiente

---

## Phase 4: User Story 2 - Registrarse como cliente (Priority: P2)

**Goal**: Alta pública de cuentas con rol `usuario`.

**Independent Test**: Un visitante se registra y luego inicia sesión.

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Test de registro en `backend/tests/auth.test.ts` (201, correo duplicado 409, datos inválidos 400, rol forzado `usuario`)

### Implementation for User Story 2

- [ ] T022 [P] [US2] Añadir `register` a `backend/src/services/auth.service.ts` (hash bcrypt, rol `usuario`, unicidad de correo)
- [ ] T023 [US2] Añadir `POST /auth/register` en `auth.controller.ts` y `auth.routes.ts` con schema zod
- [ ] T024 [US2] Añadir formulario de registro en `frontend/src/pages/Login.tsx` o `frontend/src/pages/Registro.tsx`

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Administrar usuarios operativos (Priority: P3)

**Goal**: El administrador crea, edita y deshabilita cajeros/cocineros.

**Independent Test**: El admin crea un cajero (puede iniciar sesión) y lo deshabilita (ya no
puede).

### Tests for User Story 3 ⚠️

- [ ] T025 [P] [US3] Test de gestión de usuarios en `backend/tests/usuarios.test.ts` (crear, editar, deshabilitar; 403 para no-admin; 409 correo duplicado)

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implementar `backend/src/services/usuarios.service.ts` (listar, crear, actualizar, deshabilitar; sólo operativos)
- [ ] T027 [US3] Implementar `backend/src/controllers/usuarios.controller.ts` y `backend/src/routes/usuarios.routes.ts` (`GET/POST /usuarios`, `PATCH/DELETE /usuarios/{id}`) protegidos con `requireRole('administrador')`
- [ ] T028 [US3] Crear `frontend/src/pages/admin/Usuarios.tsx` (listado, alta y baja de operativos) con TanStack Query

**Checkpoint**: Todas las historias funcionan de forma independiente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias

- [ ] T029 [P] Documentar variables y pasos en `README.md` del backend y del frontend
- [ ] T030 Endurecer login (rate limiting básico / retardo) y comparación de tiempo constante
- [ ] T031 [P] Validar respuestas de error sin filtrar información interna (revisar `errorHandler`)
- [ ] T032 Verificar `npm run typecheck` y `npm test` en verde (backend y frontend)
- [ ] T033 Ejecutar los escenarios de `quickstart.md` y registrar resultados para la demo

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias
- **User Stories (Phases 3–5)**: dependen de Foundational; US1 es P1 (MVP), US2/US3 pueden ir en paralelo
- **Polish (Phase 6)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: sin dependencias tras Foundational
- **US2 (P2)**: reutiliza `auth.service`; independiente en prueba
- **US3 (P3)**: depende de `requireRole` (US1) pero es independiente en prueba

### Parallel Opportunities

- T002–T005 en paralelo; T009–T010 en paralelo
- Tests de cada historia en paralelo (T013/T014, T021, T025)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 → Phase 2 → Phase 3 (US1)
2. **STOP y VALIDAR**: login por rol y guard de rutas
3. Demo si está listo

### Incremental Delivery

1. Setup + Foundational
2. US1 → validar → demo
3. US2 → validar
4. US3 → validar → demo del sprint

---

## Notes

- [P] = archivos distintos, sin dependencias
- Etiqueta [Story] para trazabilidad con `spec.md`
- Commit tras cada tarea o grupo lógico; no versionar `.env`
