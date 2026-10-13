# Research: Fundación y autenticación (Sprint 1)

Decisiones técnicas que resolverán los "NEEDS CLARIFICATION" del plan. Todas respetan la
constitución y evitan dependencias innecesarias.

## 1. Mecanismo de sesión

- **Decision**: JWT firmado con HS256, con expiración, transportado en una cookie
  `httpOnly` + `SameSite=Lax` (y `Secure` en producción). Endpoint `GET /api/auth/me` valida la
  sesión para el guard del frontend.
- **Rationale**: `httpOnly` mitiga robo de token por XSS; stateless, simple y compatible con la
  app única.
- **Alternatives considered**: token en `localStorage` (vulnerable a XSS); sesiones en servidor
  con tabla de sesiones (más estado y complejidad de la necesaria).

## 2. Hash de contraseñas

- **Decision**: `bcryptjs` con coste 10.
- **Rationale**: pura JS (sin compilación nativa, evita fricción en Windows), suficiente para el
  MVP; cumple "nunca en texto plano".
- **Alternatives considered**: `bcrypt` nativo (build), `argon2` (mayor coste de setup).

## 3. Acceso a datos

- **Decision**: `mysql2/promise` con pool de conexiones y SQL parametrizado; sin ORM.
- **Rationale**: Requisito constitucional (§4: sin ORMs innecesarios) y el esquema ya existe en
  SQL.
- **Alternatives considered**: Prisma/Sequelize (rechazado por constitución).

## 4. Validación de entrada

- **Decision**: `zod` compartido por lógica (schemas por entidad en el backend; reutilizados en
  formularios del frontend).
- **Rationale**: Validación declarativa, tipada y única fuente de verdad; cumple §14.
- **Alternatives considered**: validación manual (propensa a errores), `joi` (duplicaría).

## 5. Autorización por rol

- **Decision**: Middlewares `requireAuth` (valida JWT y carga el usuario) y
  `requireRole('administrador', ...)`; el rol viaja en el token y se re-verifica contra `rol`.
- **Rationale**: Centraliza el control de acceso; cumple §5 y §16.
- **Alternatives considered**: verificación de rol en cada controlador (duplicación).

## 6. Migraciones

- **Decision**: Archivos SQL numerados en `database/migrations/`, aplicados por un runner
  mínimo (`npm run migrate`) que registra las versiones aplicadas en una tabla
  `migracion_aplicada`.
- **Rationale**: Sin herramienta extra; mantiene el control explícito de §4 y §17.
- **Alternatives considered**: `knex`/`flyway` (dependencia innecesaria para el tamaño).

## 7. Estructura del frontend y guard de rutas

- **Decision**: `react-router-dom` con un componente `ProtectedRoute` que consulta `useAuth`
  (obtenido de `/api/auth/me` vía TanStack Query) y redirige a `/login` o deniega según el rol.
- **Rationale**: App única con rutas por rol (§2); un solo punto de control.
- **Alternatives considered**: guard por página (duplicación, riesgo de inconsistencias).

## 8. Seed de cuentas operativas

- **Decision**: `002_seed_inicial.sql` crea los roles; un seed adicional
  `003_seed_usuarios.sql` crea un administrador, un cajero y un cocinero con contraseñas
  hasheadas y documentadas sólo para desarrollo (nunca credenciales reales en el repo).
- **Rationale**: Permite probar la demo del sprint; cumple "sin credenciales en el código".
- **Alternatives considered**: alta manual del primer admin (bloquea la puesta en marcha).

## 9. Manejo de errores

- **Decision**: `errorHandler` central que mapea errores de dominio a códigos HTTP y mensajes
  claros; nunca expone stack traces; registra en consola/archivo en el servidor.
- **Rationale**: Cumple §15.

## 10. Cómo correr (dev)

- **Decision**: Backend con `tsx watch src/server.ts`; frontend con `vite`. CORS habilitado con
  `credentials` para el origen de Vite; variables en `.env` (no versionado).
- **Rationale**: DX simple y compatible con el stack elegido.
