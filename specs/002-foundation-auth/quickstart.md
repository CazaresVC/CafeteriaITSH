# Quickstart: Fundación y autenticación (Sprint 1)

Guía de validación end-to-end del sprint. No incluye la implementación; referencia el
`data-model.md` y `contracts/openapi.yaml`.

## Prerequisitos

- Node.js LTS (22.x) y npm.
- MySQL 8.0+ en ejecución.
- Variables de entorno en `.env` (no versionado): `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`,
  `PORT` (y el origen del frontend para CORS).

## Puesta en marcha

```bash
# Backend
cd backend
npm install
npm run migrate            # aplica database/migrations/*.sql
npm run dev                # tsx watch src/server.ts

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                # vite
```

## Escenarios de validación

1. **Login por rol** — Con credenciales válidas de `administrador`, `cajero`, `cocinero` y
   `usuario`, iniciar sesión y verificar que cada rol aterriza en su módulo
   (`/admin`, `/caja`, `/cocina`, `/menu`).
   - Esperado: redirección correcta; `GET /api/auth/me` devuelve el usuario.
2. **Credenciales inválidas** — Intentar login con contraseña incorrecta.
   - Esperado: HTTP 401 con mensaje genérico; no revela si el correo existe.
3. **Ruta sin sesión** — Abrir `/admin` sin sesión.
   - Esperado: redirección a `/login`.
4. **Ruta con rol incorrecto** — Autenticado como `usuario`, abrir `/caja`.
   - Esperado: acceso denegado (no renderiza el módulo).
5. **Registro de cliente** — Registrarse con un correo nuevo.
   - Esperado: crea cuenta con rol `usuario` y permite iniciar sesión.
6. **Correo duplicado** — Registrarse con un correo existente.
   - Esperado: rechazo con mensaje claro (409).
7. **Administración de operativos** — Como administrador, crear un cajero y luego
   deshabilitarlo.
   - Esperado: el cajero puede iniciar sesión; tras deshabilitarlo, ya no puede.
8. **Contraseñas** — Revisar la BD.
   - Esperado: `password_hash` (bcrypt), nunca texto plano; sin credenciales en el repo.

## Verificación automatizada

```bash
cd backend && npm test      # unit + integración (supertest)
cd frontend && npm test     # ProtectedRoute (RTL)
```

Criterios en verde: `spec.md` → Success Criteria SC-001…SC-006.
