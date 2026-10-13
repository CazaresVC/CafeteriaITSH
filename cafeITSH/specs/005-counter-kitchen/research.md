# Research: Mostrador y cocina (Sprint 4)

Decisiones técnicas que resuelven los puntos abiertos del plan para el Sprint 4. Todas respetan
la constitución, reutilizan la infraestructura del Sprint 1 y evitan dependencias innecesarias.

## 1. Flujo de creación de un pedido de mostrador

- **Decision**: `POST /api/pedidos/mostrador` crea el pedido con `tipo='mostrador'`,
  `creado_por = usuario.id` de la sesión (cajero), `cliente_nombre` opcional, `usuario_id`
  nulo, `fecha_recoleccion` nula y estado inicial `Pendiente`. El total se calcula en el
  servidor sumando `menu_dia.precio × cantidad` de cada línea; el cliente nunca envía precios.
  Se persisten `pedido` y sus `pedido_detalle` en una sola transacción SQL.
- **Rationale**: Cumple FR-006/FR-024 (captura con pocos pasos) y la restricción
  `chk_pedido_anticipado`, que exige `usuario_id`/`fecha_recoleccion` nulos para `mostrador`.
  Calcular el total en el servidor evita manipulación de precios desde el frontend.
- **Alternatives considered**: enviar el total desde el cliente (inseguro); crear como
  `anticipado` y reclasificar (violaría la restricción y confundiría la cola).

## 2. Cobro en efectivo y transición a "Pagado"

- **Decision**: `POST /api/pedidos/{id}/cobro` registra una fila en `pago` con
  `metodo='efectivo'`, `monto = pedido.total`, `registrado_por = usuario.id` y transiciona el
  pedido `Pendiente → Pagado` en la misma transacción SQL. Solo `cajero` puede cobrar.
- **Rationale**: Cumple FR-007/FR-025 y la restricción `chk_pago_metodo`. La unicidad
  `uq_pago_pedido` impide cobros duplicados; el estado solo cambia si el pago se inserta
  correctamente.
- **Alternatives considered**: método `online` (reservado a pedidos anticipados del Sprint 3);
  cobro sin registrar pago (perdería trazabilidad contable).

## 3. Fuente de verdad de la máquina de estados

- **Decision**: La validez de una transición se consulta SIEMPRE contra la tabla
  `transicion_estado` (origen de datos del par `desde_id, hacia_id`), no contra reglas
  codificadas en el servicio. `backend/src/services/estado.service.ts` expone
  `validarTransicion(estadoActualId, estadoNuevoId)` que ejecuta una consulta parametrizada;
  si no existe la fila, se rechaza con `409`.
- **Rationale**: Cumple FR-003/FR-021 y la decisión de diseño del esquema ("validación por
  datos"). El seed `002_seed_inicial.sql` ya define exactamente: Pendiente→Pagado,
  Pagado→En preparación, En preparación→Listo, Listo→Entregado y →Cancelado desde cualquier
  estado previo a Entregado. Cambiar el flujo no requiere recompilar.
- **Alternatives considered**: tabla de transiciones en código (duplicaría la fuente de verdad
  y podría divergir del seed).

## 4. Registro del historial de cambios de estado

- **Decision**: Cada cambio exitoso escribe una fila en `pedido_estado_historial`
  (`estado_anterior_id`, `estado_nuevo_id`, `cambiado_por = usuario.id`, `fecha` por defecto) y
  actualiza `pedido.estado_id` dentro de la MISMA transacción SQL. El primer cambio
  (`Pendiente`) no genera fila de historial; el historial registra solo transiciones.
- **Rationale**: Cumple FR-019 y deja auditoría completa de quién movió cada pedido y cuándo,
  requisito de trazabilidad de caja y cocina.
- **Alternatives considered**: triggers de BD (el esquema evita triggers por portabilidad);
  historial diferido (perdería atomicidad con el cambio de estado).

## 5. Orden de preparación en la KDS

- **Decision**: `GET /api/pedidos?estado=...&origen=...` ordena por llegada: `creado_en ASC`,
  desempatando por `id ASC`. El listado de cocina mezcla ambos orígenes sin distinción de
  prioridad. Se expone además `fecha_recoleccion` (solo informativa para anticipados) para que
  el cocinero anticipe, pero el orden primario es `creado_en` para ser justo con el mostrador.
- **Rationale**: Cumple FR-010/FR-033 y SC-003 (100 % de entrantes ordenado por llegada). Usar
  `creado_en` garantiza un orden único y estable para ambos orígenes.
- **Alternatives considered**: ordenar por `fecha_recoleccion` (dejaría fuera a los de
  mostrador, que la tienen nula); priorizar anticipados (rompería la simplicidad de la cola).

## 6. Actualización en vivo sin recarga manual (sondeo)

- **Decision**: La pantalla de cocina usa TanStack Query con `refetchInterval: 5000` (5 s) y
  `refetchIntervalInBackground: true`; las mutaciones invalidan la query de pedidos al
  completarse. No se incorporan WebSocket ni SSE.
- **Rationale**: Cumple FR-012/FR-035 y SC-004 con una dependencia ya presente
  (`@tanstack/react-query`) y sin infraestructura de servidor adicional; el polling cubre de
  sobra la escala de una cafetería (constitución §8/§20: evitar dependencias innecesarias).
- **Alternatives considered**: WebSocket/Socket.IO (servidor con estado, dependencia y
  complejidad no justificadas en el MVP); SSE (requiere manejo de reconexión y es superfluo
  para 1–2 pantallas); recarga manual (incumple FR-012).

## 7. Concurrencia en la actualización de estado

- **Decision**: `PATCH /api/pedidos/{id}/estado` lee el pedido con `SELECT ... FOR UPDATE`
  dentro de una transacción, valida la transición contra `transicion_estado`, actualiza
  `pedido.estado_id` y escribe el historial; si el estado leído ya no coincide con el estado
  esperado por el cliente, se responde `409`. Si dos operadores actúan a la vez, el bloqueo de
  fila serializa las operaciones y el segundo recibe un conflicto en lugar de un salto inválido.
- **Rationale**: Cumple FR-004/FR-022 y las edge cases de la spec (dos operadores sobre el
  mismo pedido; cancelación de un pedido que ya estaba en preparación). Evita condiciones de
  carrera sin capas extra.
- **Alternatives considered**: bloqueo optimista con versión de fila (el esquema no tiene
  columna de versión); confiar en la UI (no es a prueba de concurrencia).

## 8. Rechazo de saltos y de cambios sobre estados terminales

- **Decision**: Al no existir transición en `transicion_estado` para el par solicitado, el
  servicio responde `409 Conflict` con mensaje claro ("Transición de estado no permitida").
  Como no hay transiciones cuyo `desde_id` sea `Entregado` o `Cancelado`, un pedido terminal no
  puede cambiar de estado por diseño de datos.
- **Rationale**: Cumple FR-004/FR-022 y SC-001 (100 % de transiciones inválidas rechazadas),
  sin código de excepción específico para estados terminales.
- **Alternatives considered**: lista de estados inmutables en código (duplicaría la lógica de
  `transicion_estado`).

## 9. Autorización de cada acción

- **Decision**: Todas las rutas de `/api/pedidos` exigen sesión (`requireAuth`). Crear
  mostrador y cobrar usan `requireRole('cajero')`; listar, obtener y cambiar estado aceptan
  `requireRole('cajero', 'cocinero')`. El `cambiado_por`/`registrado_por` se toma siempre de la
  sesión, nunca del cuerpo de la petición.
- **Rationale**: Cumple FR-003/FR-005 y la constitución §5/§16; impide que un operator falsifique
  la autoría de un cambio de estado.
- **Alternatives considered**: un único rol por endpoint (impediría que caja entregue un pedido
  listo, contemplado en US3).

## 10. Contratos y validación de entrada

- **Decision**: Esquemas `zod` en `backend/src/utils/schemas/pedidos.schema.ts` para
  `CrearMostradorInput` (items no vacíos, `cantidad > 0`), `CobroInput` (`metodo='efectivo'`) y
  `CambioEstadoInput` (`estado` en el conjunto válido). El middleware `validate` existente los
  aplica antes de llegar al controlador.
- **Rationale**: Cumple FR-038 y la constitución §14; validación declarativa compartida con los
  formularios del frontend.
- **Alternatives considered**: validación manual en cada controlador (duplicación y errores).

## 11. Estrategia de pruebas

- **Decision**: Tests de integración con `supertest` sobre una base de datos de prueba para los
  flujos de cada historia: creación+cobro de mostrador (`mostrador.test.ts`), listado y avance
  en cocina (`cocina.test.ts`) y transiciones válidas/inválidas + estado terminal
  (`transiciones.test.ts`). Tests de componente con RTL para `Caja.tsx` y `Cocina.tsx`
  (renderizado, acciones y refresco). Unit tests de cálculo de total y de
  `validarTransicion`.
- **Rationale**: Cumple la constitución §20 (pruebas de la lógica crítica: creación y
  validación de pedidos, cálculo de totales, cambios de estado y control de permisos).
- **Alternatives considered**: solo pruebas manuales (no cubriría la lógica de transiciones ni
  la concurrencia).

## 12. Cómo correr (dev)

- **Decision**: Igual que el Sprint 1: backend con `tsx watch src/server.ts` y frontend con
  `vite`; migraciones ya aplicadas (`npm run migrate`). Acceso a caja con una cuenta `cajero` y
  a cocina con una cuenta `cocinero` (seed `003_seed_usuarios.sql`). Variables en `.env` no
  versionado.
- **Rationale**: DX consistente con los sprints previos; sin cambios de infraestructura.
