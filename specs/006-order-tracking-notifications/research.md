# Research: Seguimiento, notificaciones y cierre (Sprint 5)

Decisiones técnicas que resuelven los "NEEDS CLARIFICATION" del plan. Todas respetan la
constitución y evitan dependencias innecesarias.

## 1. Disparador de la notificación (evento de dominio en la transición a "Listo")

- **Decision**: emitir un **evento de dominio** `pedido.listo` mediante un `EventEmitter`
  tipado (`backend/src/services/eventosPedido.ts`) en el único punto donde un pedido pasa de
  "En preparación" a "Listo" (servicio de transición de estados del Sprint 4). El evento lleva
  `{ pedidoId, usuarioId, numero, fecha }`.
- **Rationale**: Un pedido "Listo" es la condición exacta de negocio del aviso; emitir el
  evento en la transición (no en la ruta HTTP ni en cada vía de cambio de estado) garantiza el
  100 % de los avisos (SC-001) y evita duplicar la lógica.
- **Alternatives considered**: disparar la notificación desde el controlador de cocina (se
  duplicaría por cada vía de cambio y acoplaría la ruta al envío); *polling* de la tabla
  `pedido` buscando nuevos "Listo" (costoso y con riesgo de perder o duplicar eventos).

## 2. Desacoplamiento del módulo de notificaciones

- **Decision**: mantener `services/notificaciones.service.ts` (persistencia y orquestación) y
  `services/notificacion.provider.ts` (canales) **separados** de `services/pedidos.service.ts`.
  La conexión se hace con un único *listener* registrado al arrancar la app que escucha
  `pedido.listo`; el servicio de pedidos no importa nada del módulo de notificaciones.
- **Rationale**: Cumple FR-037 y el principio VI (la funcionalidad de notificaciones MUST
  mantenerse separada de la lógica de pedidos): el pedido sólo publica un hecho, sin saber
  quién reacciona.
- **Alternatives considered**: llamada directa `notificacionesService.enviar()` desde el
  servicio de pedidos (acoplamiento y ruta crítica frágil); *message broker* externo
  (infraestructura innecesaria para el MVP).

## 3. Estrategia de canal (in-app mínimo, externo opcional)

- **Decision**: el canal **in-app es obligatorio** (el aviso queda consultable en
  `GET /notificaciones/mias` y visible en el *badge* del cliente). El proveedor externo
  (correo/push) es **opcional**: si `NOTIFICATION_API_KEY` no está definida, el proveedor
  degrada a sólo in-app. El `canal` persistido usa el catálogo permitido
  (`'correo'`, `'push'`, `'sms'`).
- **Rationale**: Entrega el objetivo del producto sin depender de un tercero; el valor del
  canal externo se puede activar después sin cambios de esquema.
- **Alternatives considered**: correo obligatorio con SMTP propio (fricción y credenciales);
  push web con Service Worker (complejidad y permisos del navegador fuera del MVP).

## 4. Manejo de reintentos y fallos (sin corromper el pedido)

- **Decision**: cada intento de envío queda registrado en `notificacion` con `estado_envio`
  (`'pendiente'` → `'enviada'` o `'fallida'`); ante fallo se guarda `detalle_error` y el
  reintento se hace con un proceso dedicado (`reintentarFallidas`, ejecutado por un job ligero
  o un endpoint administrativo interno) que vuelve a intentar las `'fallida'`. La emisión
  ocurre **después** de confirmar la transición "En preparación" → "Listo" y envuelta en
  `try/catch`: un error del canal nunca cambia el estado del pedido.
- **Rationale**: Cumple FR-006, el escenario 2 de US2 y el `chk_notificacion_estado` de la
  tabla; el estado del pedido es la fuente de verdad y permanece intacto.
- **Alternatives considered**: reintento inmediato en el mismo request (bloquea y puede
  propagar el fallo); colas con *backoff* (infraestructura excesiva para el MVP).

## 5. Idempotencia (evitar avisos duplicados)

- **Decision**: reforzar `notificacion` con unicidad `(pedido_id, tipo)` mediante la migración
  `003_notificaciones.sql`, de modo que un reintento o una doble emisión no genere un segundo
  aviso del mismo tipo (`'pedido_listo'`). El `INSERT` usa `INSERT ... ON DUPLICATE KEY UPDATE`.
- **Rationale**: Cumple el caso límite "reintento sin duplicar avisos" y hace segura la
  re-emisión.
- **Alternatives considered**: comprobar existencia con `SELECT` previo (condición de carrera
  entre emisiones concurrentes).

## 6. Autorización de propiedad para /mis-pedidos

- **Decision**: `requireAuth` valida la sesión y `requireRole('usuario')` restringe el módulo;
  además, el acceso a datos filtra **siempre** por el `usuario_id` del token
  (`WHERE usuario_id = ?` y `WHERE p.id = ? AND p.usuario_id = ?`). El detalle de un pedido
  ajeno responde **404** (no 403) para no revelar su existencia.
- **Rationale**: Cumple FR-003, SC-004 y la separación por roles; el filtro por dueño en SQL
  evita *Insecure Direct Object Reference* sin capas extra.
- **Alternatives considered**: confiar en el `id` de la URL (vulnerable a IDOR); comprobar el
  dueño en el frontend (inseguro, no confiable).

## 7. Actualización en vivo (polling con TanStack Query)

- **Decision**: refresco por **polling** con `refetchInterval` de TanStack Query (p. ej. 5 s en
  `/mis-pedidos` y en las notificaciones), con `refetchOnWindowFocus`. No se usa WebSocket ni
  SSE en el MVP.
- **Rationale**: Simplicidad (§VIII), sin infraestructura de tiempo real; suficiente para que
  el cliente vea el estado actualizado y el aviso sin recarga manual.
- **Alternatives considered**: WebSocket/SSE (complejidad de servidor, reconexión y pruebas
  innecesarias para el tamaño del MVP).

## 8. Pruebas y alcance del pulido del MVP

- **Decision**: Vitest en ambas capas. Pruebas críticas **obligatorias** de: cambio de estados
  y transiciones inválidas, pago confirmado/no confirmado, y **permisos** (cliente no ve
  pedidos ajenos, rutas por rol). Con `supertest` se prueba el flujo completo
  (menú → selección → pedido → pago → cocina → preparación → listo → notificación →
  recogida) como escenario de aceptación. El pulido se guía por `.stitch/DESIGN.md` (tokens de
  referencia, no requisito al 100 %), priorizando legibilidad y botones táctiles ≥ 44 px en caja
  y cocina.
- **Rationale**: Cumple §VIII y las SC-002/SC-003/SC-005; cierra el MVP con evidencia
  verificable para la demostración a la patrocinadora.
- **Alternatives considered**: cobertura exhaustiva de UI (fuera del alcance académico); pulido
  sin pruebas (no demostrable ante la patrocinadora).

## 9. Cómo correr (dev)

- **Decision**: backend con `tsx watch src/server.ts`; frontend con `vite`; migraciones con
  `npm run migrate`. Variables en `.env` (no versionado): las de sprints previos más
  `NOTIFICATION_API_KEY` (opcional) y `NOTIFICATION_PROVIDER`. CORS con `credentials` para el
  origen de Vite.
- **Rationale**: DX simple y compatible con el stack ya elegido; sin dependencias nuevas.
