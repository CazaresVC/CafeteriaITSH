# Quickstart: Mostrador y cocina (Sprint 4)

Guía de validación end-to-end del sprint de operación interna. No incluye la implementación;
referencia `data-model.md` y `contracts/openapi.yaml`.

## Prerequisitos

- Sprints 001–003 completados: fundación y autenticación (Sprint 1), gestión de menú
  (Sprint 2) y pedidos anticipados con pago (Sprint 3).
- Node.js LTS (22.x) y npm.
- MySQL 8.0+ en ejecución, con las migraciones aplicadas
  (`database/migrations/001_crear_esquema.sql`, `002_seed_inicial.sql` y el seed de usuarios).
- Variables de entorno en `.env` (no versionado): `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`,
  `PORT`, `CORS_ORIGIN`.
- Al menos un usuario operativo `cajero` y uno `cocinero` (seed `003_seed_usuarios.sql`).
- Menú del día con platillos disponibles (`menu_dia.disponible = 1`).

## Puesta en marcha

```bash
# Backend
cd backend
npm install
npm run migrate            # aplica database/migrations/*.sql (idempotente)
npm run dev                # tsx watch src/server.ts

# Frontend (otra terminal)
cd frontend
npm install
npm run dev                # vite
```

Iniciar sesión en dos navegadores (o ventanas): uno como `cajero` (ruta `/caja`) y otro como
`cocinero` (ruta `/cocina`).

## Escenarios de validación

1. **Capturar un pedido de mostrador** — Como cajero, agregar dos platillos disponibles con sus
   cantidades y confirmar.
   - Esperado: `201`; el pedido se crea `tipo='mostrador'`, estado `Pendiente`, con folio y
     total calculado por el servidor (con `cliente_nombre` opcional).
2. **Cobro en efectivo** — Sobre el pedido anterior, registrar el cobro.
   - Esperado: `200`; se inserta `pago.metodo='efectivo'`, `monto = total` y el pedido pasa a
     `Pagado`. Un segundo cobro responde `409`.
3. **Caja + anticipados concurrentes (SC-002)** — Con al menos un pedido anticipado ya
   `Pagado` (Sprint 3), capturar y cobrar varios pedidos de mostrador mientras el anticipado
   permanece activo.
   - Esperado: ambos orígenes conviven sin bloqueos cruzados; la base refleja cada pedido con su
     `tipo` y estado correctos.
4. **KDS con ambos orígenes ordenados por llegada (SC-003)** — Como cocinero, abrir `/cocina`.
   - Esperado: la lista muestra los pedidos entrantes anticipados **y** de mostrador con sus
     productos y cantidades, ordenados por `creado_en` (empate por `id`).
5. **Avanzar estados en cocina (SC-005)** — Tomar un pedido `Pagado → En preparación` y luego
   `En preparación → Listo`, en 2 interacciones o menos por cambio.
   - Esperado: `200` en cada transición; `estado_id` actualizado y una fila por cambio en
     `pedido_estado_historial` con `cambiado_por` = cocinero.
6. **Actualización en vivo sin recarga manual (SC-004)** — Dejar la pantalla de cocina abierta
   y, desde el otro navegador, cobrar un nuevo pedido de mostrador (o crear uno anticipado).
   - Esperado: el nuevo pedido aparece en la KDS en ≤ 5 s (sondeo `refetchInterval`) sin recargar
     la página; los cambios de estado de otros operadores también se reflejan.
7. **Transición inválida por salto** — Con un pedido `Pagado`, intentar `PATCH` directo a
   `Listo`.
   - Esperado: `409 "Transición de estado no permitida"`; el estado no cambia.
8. **Entrega** — Con un pedido `Listo`, marcarlo `Entregado`.
   - Esperado: `200`; queda en `Entregado` y cualquier cambio posterior responde `409`.
9. **Cancelación** — Con un pedido en estado previo a `Entregado` (p. ej. `En preparación`),
   cancelarlo.
   - Esperado: `200`; pasa a `Cancelado` y no admite más cambios. Cancelar un pedido ya
     `Entregado` responde `409`.
10. **Concurrencia** — Con la KDS y la caja abiertas, intentar cambiar el mismo pedido desde
    ambos a la vez.
    - Esperado: la primera operación gana; la segunda responde `409` (bloqueo de fila
      `SELECT ... FOR UPDATE`), sin saltos de estado.
11. **Autorización** — Abrir `/caja` como cocinero y `/cocina` como cajero; llamar
    `POST /api/pedidos/mostrador` sin rol `cajero`.
    - Esperado: acceso denegado (`403`) y sin renderizado del módulo ajeno.
12. **Accesibilidad de operación** — Revisar botones de caja y cocina.
    - Esperado: área táctil ≥ 44 px y alto contraste (constitución §19).

## Verificación automatizada

```bash
cd backend && npm test      # integración: mostrador.test.ts, cocina.test.ts, transiciones.test.ts
cd frontend && npm test     # Caja.test.tsx, Cocina.test.tsx (RTL)
```

Criterios en verde: `spec.md` → Success Criteria SC-001…SC-005.
