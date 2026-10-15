# AGENTS.md — Sistema de Pedidos Anticipados (Cafetería ITSH)

Sistema de pedidos anticipados, dividido en `backend/` (API) y `frontend/` (SPA), sin workspaces.
Desarrollado por sprints con specification-driven development: cada sprint vive en `specs/00X-*/`
(`tasks.md` con casillas, `contracts/openapi.yaml`, `quickstart.md`). Después de implementar una
tarea: marcar su casilla `[x]`, mantener el contrato reconciliado (respuestas **camelCase** reales)
y ejecutar todas las verificaciones. Construir en `docs/sprints.md`.

## Env (Windows + PowerShell)

- **`npm` resuelve a `npm.ps1` y está bloqueado: usar SIEMPRE `npm.cmd`** (p.ej. `npm.cmd test`).
- Enviar JSON por `curl.exe` con archivo: `--data-binary "@archivo.json"` con UTF-8. El `-d '{"..."}'`
  inline en PowerShell llega con llaves literales y el backend responde 500. Los acentos en el texto
  de un comando se corrompen; prefiere escribirlos en archivos.
- El servidor dev (port 3000) recarga solo; Vite (5173) proxya `/api` → `:3000`.

## Comandos (ejecutar dentro de cada carpeta)

- Backend (`cd backend`): `npm.cmd run dev` · `npm.cmd test` · `npm.cmd run typecheck` ·
  `npm.cmd run build` · `npm.cmd run migrate`. No hay script `lint` en backend.
- Frontend (`cd frontend`): `npm.cmd run dev` · `npm.cmd test` · `npm.cmd run typecheck` ·
  `npm.cmd run lint` · `npm.cmd run build`. `build` ya hace `tsc --noEmit && vite build`.

## Stack y convenciones

- Backend: CommonJS estricto, Express 4, `mysql2/promise` + SQL parametrizado (sin ORM), `zod`,
  JWT HS256 en cookie httpOnly `token`, `bcryptjs` cost 10. Imports relativos sin extensión.
- Frontend: ESM, React 19, Vite, react-router 7, TanStack Query 5, `react-hook-form` + `zodResolver`
  en formularios, axios (`api` con `baseURL /api` + `withCredentials`), Tailwind v4, `clsx`/`tailwind-merge`.
  Imports relativos (la alias `@/` está configurada pero no se usa).
- **Constitución (§8/§20): no añadir dependencias npm nuevas**; pruebas obligatorias para la lógica
  crítica (estados, pagos, permisos).

## Configuración de pruebas

- Backend: config en `backend/vitest.config.ts` (env node, sin `globals`: importar de `'vitest'`).
  El `tests/setup.ts` fija variables de entorno, así que los tests corren sin `.env`.
- Frontend: la config de Vitest está **dentro de `vite.config.ts`** (no hay `vitest.config.ts`),
  `globals: true` (los `describe/it` son globales), jsdom.
- Tests de backend con mock de `../src/config/db` (`query: vi.fn()`, `conTransaccion: vi.fn()`).
  `requireAuth` consume el **primer** `queryMock`; luego `requireRole` lee `req.usuario.rol` sin DB;
  después vienen las queries del servicio: todo encadenado en un solo `queryMock`. En `conTransaccion`,
  el mock llama `fn({ execute: ... })` delega a `queryMock`. Patrón en tests: `vi.hoisted` + `vi.mock`.
- `firmarToken({ sub, rol })` exige `rol: RolNombre` (unión literal de `src/utils/roles.ts`); los
  helpers de test NO deben tipar `rol` como `string` (rompe `typecheck`).

## MySQL y migraciones

- `database/migrations/NNN_*.sql` se aplican en orden con `npm run migrate`
  (`backend/src/db/migrate.ts`), idempotente vía tabla `migracion_aplicada`.
  **Cada archivo SQL debe arrancar con `SET NAMES utf8mb4;`** (cargar con la CLI del cliente a mano
  corrompe los acentos). La última `005_seed_demo.sql` también siembra datos de demo (sólo dev).
- `mysql2` con `dateStrings: true` y DECIMAL como string: **envolver con `Number()`**.
- Errores de negocio: clases en `src/utils/errors.ts` → cuerpo uniforme `{ error: { codigo, mensaje } }`,
  sin stack traces.
- Express 4: `req.query` es *getter-only*; **no pasar query por el middleware `validate`** (es sólo
  para body/params): los controladores usan `safeParse` directamente sobre `req.query`.

## Dominio (pedidos)

- Flujo: `Pendiente → Pagado → En preparación → Listo → Entregado`; cancelable desde cualquier
  estado pre-entrega. Reglas en tablas `estado_pedido`/`transicion_estado`.
- `GET /pedidos/{id}` de un pedido **ajeno → 404** (no 403), para no revelar existencia.
- La notificación de "pedido listo" se dispara **por evento de dominio** (`services/eventosPedido.ts`)
  al pasar a `Listo`, fuera de la ruta crítica; un fallo de canal deja el pedido intacto y el aviso
  `fallida` para reintento.
- `POST /api/auth/register` crea el cliente con rol `usuario` pero **no emite cookie**; el flujo es
  register → login.
- Rutas nuevas de Sprint 5: declarar `GET /:recurso/mios` ANTES de `/:id` (ordre de Express).
- Estado del repo: trabajo sin commitear (["si sin comittear"]).

## Demo (credenciales de desarrollo)

`cliente@cafeitsh.local`/`Cliente1234`, `cajero@cafeitsh.local`/`Cajero1234`,
`cocinero@cafeitsh.local`/`Cocinero1234`, `admin@cafeitsh.local`/`Admin1234`. Guion completo en
`docs/demo-sprint5.md`. No versionar `backend/.env` (crear desde `.env.example`; requiere
`DATABASE_URL` y `JWT_SECRET`; `SET`-ups de notificación opcionales).