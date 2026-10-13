# Research: Pedido anticipado y pago (Sprint 3)

Decisiones técnicas que resuelven los "NEEDS CLARIFICATION" del plan, respetando la
constitución.

## 1. Ventana de pedido anticipado

- **Decision**: Validar en el backend que la hora actual esté dentro de una ventana configurable
  (`PEDIDO_VENTANA_INICIO`/`PEDIDO_VENTANA_FIN`, por defecto el horario previo al receso) al
  crear el pedido; fuera de ventana se responde `422` con mensaje claro.
- **Rationale**: Cumple FR-015/FR-016 y permite ajustar la política sin cambiar código.
- **Alternatives considered**: permitir pedidos a cualquier hora (rompe el concepto de
  anticipado); validación sólo en frontend (evadible).

## 2. Congelamiento de precios y cálculo del total

- **Decision**: Al crear el pedido se copian `nombre`, `precio` y `cantidad` desde `menu_dia`
  hacia `pedido_detalle`; el total se calcula en el backend sumando líneas y se guarda en
  `pedido.total` (DECIMAL(10,2)).
- **Rationale**: Cumple FR-017/FR-018; el pedido es auditable aunque el menú cambie después.
- **Alternatives considered**: referenciar `menu_dia` en vivo (el precio cambiaría tras pagar).

## 3. Estados y transición Pendiente → Pagado

- **Decision**: El pedido nace en `Pendiente` y sólo pasa a `Pagado` tras confirmar el pago;
  la transición se valida contra `transicion_estado` y se registra en
  `pedido_estado_historial` dentro de una transacción que también inserta/actualiza `pago`.
- **Rationale**: Cumple FR-019/FR-020 y §6; reutiliza el esquema sembrado.
- **Alternatives considered**: saltar a `Pagado` en la creación (imposible sin pago).

## 4. Integración de pago

- **Decision**: Definir una interfaz de pasarela (`utils/payment/gateway.ts`) con una
  implementación simulada para el MVP (aprueba/rechaza por parámetro de prueba). El endpoint
  `POST /pedidos/{id}/pagar` registra el pago y, si se aprueba, avanza el estado.
- **Rationale**: Permite sustituir por una pasarela real sin reescribir la lógica; cumple §8
  (sin dependencias innecesarias).
- **Alternatives considered**: integrar Stripe/MercadoPago ahora (fuera de alcance del MVP).

## 5. Idempotencia del cobro

- **Decision**: La confirmación de pago es idempotente por pedido: si el pedido ya está
  `Pagado`, se responde la información existente sin duplicar `pago` ni transiciones.
- **Rationale**: Evita dobles cobros por reintentos del cliente; cumple §14.
- **Alternatives considered**: sin control de idempotencia (riesgo de doble pago).

## 6. Generación de folio

- **Decision**: Folio en `pedido.numero` vía `utils/numero.ts` (secuencia única legible, p. ej.
  basada en fecha + consecutivo), con restricción única en la BD.
- **Rationale**: Identifica el pedido para cocina y para el cliente (FR-020/FR-030).
- **Alternatives considered**: usar sólo el `id` autoincremental (menos legible).

## 7. Autorización y propiedad

- **Decision**: `POST /pedidos` y `POST /pedidos/{id}/pagar` requieren `requireRole('usuario')`;
  el backend verifica que el pedido pertenezca a `usuario.id` de la sesión antes de cobrarlo.
- **Rationale**: Cumple §5/§16; evita operar pedidos ajenos.
- **Alternatives considered**: permitir a cualquier rol (riesgo de seguridad).

## 8. Estrategia de pruebas

- **Decision**: Vitest + supertest para ventana de pedido, congelamiento de precios, cálculo de
  total, folio, idempotencia y transición; Vitest + RTL para armar el carrito y confirmar el
  pago.
- **Rationale**: Cubre la lógica crítica exigida por §20.
- **Alternatives considered**: sólo pruebas manuales.

## 9. Cómo correr (dev)

- **Decision**: Backend `tsx watch src/server.ts`; frontend `vite`; variables de entorno del
  Sprint 1 más la ventana de pedido.
- **Rationale**: Consistencia con el resto del proyecto.
