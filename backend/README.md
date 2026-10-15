# Backend — Cafetería ITSH

API REST (Node + TypeScript + Express + MySQL). Los contratos de cada sprint viven en
`../specs/*/contracts/openapi.yaml`; este README resume los endpoints de **pedidos** y el flujo
de estados operado por caja y cocina.

## Endpoints de pedidos

Todas las rutas cuelgan de `/api` y usan la cookie httpOnly `token` (`requireAuth`), con control
de rol por ruta (`requireRole`). Los errores usan el sobre uniforme `{ error: { codigo, mensaje } }`.

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/pedidos` | usuario | Crear pedido anticipado (con pago en línea) |
| `POST` | `/api/pedidos/mostrador` | cajero | Capturar pedido de mostrador; total calculado en servidor |
| `GET` | `/api/pedidos?estado=&origen=` | cajero, cocinero | Listar la fila ordenada por llegada (`creado_en ASC, id ASC`) |
| `GET` | `/api/pedidos/{id}` | usuario, cajero, cocinero | Detalle; el personal recibe además el historial |
| `POST` | `/api/pedidos/{id}/pagar` | usuario | Pagar (simulado) un pedido anticipado |
| `POST` | `/api/pedidos/{id}/cobro` | cajero | Cobrar en efectivo → `Pendiente → Pagado` |
| `PATCH` | `/api/pedidos/{id}/estado` | cajero, cocinero | Cambiar de estado validando la máquina de estados |

Filtros de `GET /api/pedidos`: `estado` puede repetirse (`?estado=Pagado&estado=Listo`);
`origen` es `anticipado` o `mostrador`.

## Flujo de estados

```
Pendiente ──(pago en línea / cobro efectivo)──▶ Pagado
Pagado ──▶ En preparación ──▶ Listo ──▶ Entregado
(cualquier estado previo a Entregado) ──▶ Cancelado
```

- La validez de cada transición proviene de la tabla `transicion_estado`; los saltos
  (p. ej. `Pagado → Listo`) y los cambios sobre estados terminales (`Entregado`, `Cancelado`)
  se rechazan con **409 `CONFLICTO`**.
- Cada cambio exitoso actualiza `pedido.estado_id` e inserta una fila en
  `pedido_estado_historial` (`cambiado_por`) dentro de una transacción con `SELECT ... FOR UPDATE`,
  por lo que dos operadores concurrentes no pueden aplicar el mismo cambio (uno recibe 409).

## Scripts

- `npm run dev` — servidor con recarga (tsx watch), puerto `PORT`.
- `npm run migrate` — aplica `../database/migrations` (utf8mb4).
- `npm test` · `npm run typecheck` · `npm run build` · `npm start`.

## Seguimiento y notificaciones (Sprint 5)

| Método | Ruta | Roles | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/pedidos/mios` | usuario | Pedidos propios, orden por `creado_en DESC` |
| `GET` | `/api/pedidos/{id}` | usuario, cajero, cocinero | Detalle; el cliente solo accede a pedidos propios (404 si es ajeno) |
| `GET` | `/api/notificaciones/mias` | usuario | Avisos propios |
| `PATCH` | `/api/notificaciones/{id}/vista` | usuario | Marcar un aviso propio como visto |
| `POST` | `/api/notificaciones/reintentar` | administrador | Reintenta los avisos `fallida` (idempotente) |

- La notificación se dispara por un **evento de dominio** (`services/eventosPedido.ts`) emitido
  al pasar un pedido de "En preparación" a "Listo"; el envío vive en
  `services/notificaciones.service.ts` + `services/notificacion.provider.ts`, **separado** de la
  lógica de pedidos. Un fallo del canal deja el aviso como `fallida` (con `detalle_error`) y el
  pedido intacto; el reintento no duplica avisos por la unicidad `(pedido_id, tipo)`.
- Canal in-app siempre activo. El canal externo (correo) se activa con `NOTIFICATION_API_KEY`
  (y opcionalmente `NOTIFICATION_API_URL`); sin ella, sólo in-app. `NOTIFICATION_PROVIDER`
  documenta el proveedor elegido.

## Variables de entorno

Además de `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, `CORS_ORIGIN` y las de la ventana de
pedido (`PEDIDO_*`): `NOTIFICATION_PROVIDER` y `NOTIFICATION_API_KEY` (opcional). Ver
`.env.example`. El archivo `.env` no se versiona.
