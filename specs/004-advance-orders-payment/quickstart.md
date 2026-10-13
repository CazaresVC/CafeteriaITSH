# Quickstart: Pedido anticipado y pago (Sprint 3)

Guía para validar esta feature de forma autónoma una vez implementadas las historias.

## Prerrequisitos

- Sprints 1 y 2 implementados (sesión/roles y gestión del menú funcionando).
- MySQL 8.0+ con las migraciones aplicadas; menú del día publicado con al menos un platillo
  `disponible`.
- Backend y frontend corriendo; ventana de pedido configurada en el entorno.

## Escenario 1 — Armar y confirmar un pedido anticipado (US2, P1)

1. Inicia sesión como `usuario` y abre `/menu`.
2. Agrega uno o más platillos disponibles al carrito (`/pedido`) e indica cantidades.
3. Confirma el pedido.
4. **Resultado esperado**: se crea un pedido en estado `Pendiente` con un folio legible y el
   `total` correcto (suma de líneas con precios congelados).

## Escenario 2 — Pagar en línea (US2, P1)

1. Desde el pedido creado, ve a `/pedido/pago` y confirma el pago.
2. **Resultado esperado**: se registra un `pago` aprobado y el pedido pasa a `Pagado`,
   quedando listo para cocina.

## Escenario 3 — Fuera de la ventana de pedido (US2, P1)

1. Intenta crear un pedido fuera del horario permitido.
2. **Resultado esperado**: la solicitud se rechaza (`422`) con un mensaje claro; no se crea el
   pedido.

## Escenario 4 — Precio congelado (US2, P1)

1. Crea un pedido; luego cambia el precio del platillo en el menú de hoy.
2. Vuelve a consultar tu pedido.
3. **Resultado esperado**: el precio y el total del pedido no cambian (congelados al crearlo).

## Escenario 5 — Idempotencia del pago

1. Confirma el pago de un pedido ya `Pagado` (reintento).
2. **Resultado esperado**: no se duplica el pago ni la transición; se devuelve el estado actual.

## Verificación con pruebas

```bash
# Backend
npm run test -- pedidos.spec pago.spec   # desde backend/
# Frontend
npm run test -- Carrito.test.tsx         # desde frontend/
```

**Resultado esperado**: pruebas de ventana, congelamiento, total, folio, idempotencia y
transición en verde; prueba del carrito en verde.

## Verificación manual de errores

- Pedido sin líneas o cantidad ≤ 0 → `400`.
- Platillo no disponible o fuera de menú → `422`.
- Pagar un pedido ajeno → `403`.
- Pagar un pedido cancelado/entregado → `409`.
