# Quickstart: Seguimiento, notificaciones y cierre (Sprint 5)

Guía de validación end-to-end del sprint. No incluye la implementación; referencia el
`data-model.md` y `contracts/openapi.yaml`.

## Prerequisitos

- Sprints 1–4 ya implementados y disponibles (autenticación por rol, menú, pedido anticipado con
  pago y operación de mostrador/cocina con transiciones de estado).
- Node.js LTS (22.x) y npm.
- MySQL 8.0+ en ejecución con el esquema y los seeds de sprints previos.
- Variables de entorno en `.env` (no versionado): las de sprints previos (`DATABASE_URL`,
  `JWT_SECRET`, `NODE_ENV`, `PORT`, `CORS_ORIGIN`) más `NOTIFICATION_PROVIDER` y
  `NOTIFICATION_API_KEY` (opcional; sin ella el canal in-app es el único activo).
- Cuentas de prueba: un cliente (`usuario`) con pedidos previos y un cocinero.

## Puesta en marcha

```bash
# Backend
cd backend
npm install
npm run migrate            # aplica database/migrations/*.sql (incluye 003_notificaciones.sql)
npm run dev                # tsx watch src/server.ts

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                # vite
```

## Escenarios de validación

1. **Solo mis pedidos son visibles** — Autenticado como cliente A, abrir `/mis-pedidos`.
   - Esperado: la lista contiene únicamente pedidos de A. Con un token de B, intentar
     `GET /api/pedidos/{id}` de un pedido de A.
   - Esperado: HTTP 404 (no revela la existencia del pedido). SC-004.
2. **Detalle correcto** — Abrir el detalle de un pedido propio.
   - Esperado: se muestran platillos, cantidades, precio unitario, subtotal y **total**; el total
     coincide con `pedido.total`. FR-027.
3. **Estado actualizado (polling)** — Con `/mis-pedidos` abierto, mover el pedido de "En
   preparación" a "Listo" desde cocina.
   - Esperado: sin recargar manualmente, la lista refleja el nuevo estado en ≤ 5 s
     (`refetchInterval`). FR-026.
4. **100 % de los "Listo" generan notificación** — Sobre N pedidos, llevar cada uno a "Listo".
   - Esperado: por cada transición se inserta una fila en `notificacion` con `tipo =
     'pedido_listo'`, `canal` permitido y `estado_envio` `'enviada'` (o `'pendiente'` si el
     proveedor externo está inactivo) y aparece en `GET /api/notificaciones/mias`. SC-001.
5. **Falla del canal externo no corrompe el pedido** — Forzar el fallo del proveedor externo
   (`NOTIFICATION_API_KEY` inválida o endpoint simulado con error) y pasar un pedido a "Listo".
   - Esperado: la fila queda `estado_envio = 'fallida'` con `detalle_error` acotado; el pedido
     conserva el estado "Listo" y el resto del flujo sigue operando. Sin trazas expuestas.
   - Reintento: al reestablecer el canal y ejecutar el reintento, la notificación pasa a
     `'enviada'` y **no se duplica** (unicidad `(pedido_id, tipo)`). FR-006.
6. **Marcar aviso como visto** — `PATCH /api/notificaciones/{id}/vista` sobre un aviso propio.
   - Esperado: `vista = true`; sobre un aviso ajeno, HTTP 404.
7. **Flujo completo demostrable** — Como cliente: menú → selección → pedido con ≥ 10 min →
   pago → cocina → "En preparación" → "Listo" (se dispara el aviso) → recogida/"Entregado".
   - Esperado: el recorrido se completa de principio a fin y el cliente ve el aviso de "listo".
     SC-002 (criterio de aceptación de la spec maestra).

## Verificación automatizada

```bash
cd backend && npm test      # unit + integración (supertest)
cd frontend && npm test     # MisPedidos (RTL)
```

Criterios en verde: `spec.md` → Success Criteria SC-001…SC-005; pruebas de **estados, pagos y
permisos** (Vitest) incluidas en `backend/tests/`.

## Pulido del MVP

- Revisar `/mis-pedidos` y el aviso contra los tokens de `.stitch/DESIGN.md` (referencia, no
  requisito al 100 %).
- En caja y cocina, botones de alto contraste con área táctil ≥ 44 px y legibilidad en receso.
