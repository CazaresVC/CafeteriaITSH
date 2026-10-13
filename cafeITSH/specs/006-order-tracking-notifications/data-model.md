# Data Model: Seguimiento, notificaciones y cierre (Sprint 5)

Fuente de verdad del esquema (`database/migrations/001_crear_esquema.sql`,
`002_seed_inicial.sql` y la migración nueva `003_notificaciones.sql`). El acceso es SQL
parametrizado con `mysql2`; no hay ORM.

## Entidades

### notificacion

Aviso enviado al cliente cuando su pedido está listo. Operada de forma **independiente** de la
lógica de pedidos (un evento de dominio la dispara; el pedido no depende de ella).

Columnas existentes en `001_crear_esquema.sql`, citadas literalmente:

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` (`fk_notificacion_pedido`) ON DELETE CASCADE |
| `tipo` | VARCHAR(30) | NOT NULL |
| `canal` | VARCHAR(20) | NOT NULL |
| `estado_envio` | VARCHAR(20) | NOT NULL, DEFAULT `'pendiente'` |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `detalle_error` | TEXT | (nulo) |

Restricciones CHECK declaradas en el esquema:

```sql
CONSTRAINT chk_notificacion_canal CHECK (canal IN ('correo', 'push', 'sms')),
CONSTRAINT chk_notificacion_estado CHECK (estado_envio IN ('pendiente', 'enviada', 'fallida')),
CONSTRAINT fk_notificacion_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE
```

Valores usados por el sistema:

- `tipo`: `'pedido_listo'` (único tipo del sprint).
- `canal`: `'push'` por defecto (in-app) o `'correo'` cuando el proveedor externo está activo.
- `estado_envio`: `'pendiente'` al crear; `'enviada'` al confirmar el canal; `'fallida'` si el
  canal falla (se conserva el motivo en `detalle_error`).
- `detalle_error`: mensaje acotado del fallo del canal externo; nunca credenciales ni trazas.

Columna e índices añadidos por la migración `003_notificaciones.sql`:

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `vista` | TINYINT(1) | NOT NULL, DEFAULT 0 (0 = no leída, 1 = leída por el cliente) |

```sql
ALTER TABLE notificacion ADD COLUMN vista TINYINT(1) NOT NULL DEFAULT 0;
CREATE INDEX idx_notificacion_pedido ON notificacion(pedido_id);
ALTER TABLE notificacion ADD UNIQUE KEY uq_notificacion_pedido_tipo (pedido_id, tipo);
```

> El índice por `estado_envio` (`idx_notificacion_estado`) ya existe en `001_crear_esquema.sql`
> y da soporte a la búsqueda de avisos `'fallida'` para reintento. La unicidad
> `(pedido_id, tipo)` garantiza idempotencia (un reintento no duplica el aviso).

### pedido (lectura para el cliente)

La tabla `pedido` es la fuente del estado actual. El cliente **solo** ve sus propios registros
(`usuario_id` = usuario de la sesión).

| Campo | Tipo | Uso en esta feature |
|-------|------|---------------------|
| `id` | INT | PK; identificador en la URL del detalle |
| `numero` | VARCHAR(20) | Folio visible (`uq_pedido_numero`) |
| `tipo` | VARCHAR(20) | `'anticipado'` / `'mostrador'` (`chk_pedido_tipo`) |
| `estado_id` | INT | FK → `estado_pedido(id)`; se traduce a nombre (`Pendiente`, `Pagado`, `En preparación`, `Listo`, `Entregado`, `Cancelado`) |
| `usuario_id` | INT | FK → `usuario(id)`; **criterio de propiedad** del listado/detalle |
| `fecha_recoleccion` | DATETIME | Fecha/hora comprometida del pedido anticipado |
| `total` | DECIMAL(10,2) | Total mostrado en la lista |
| `creado_en` | DATETIME | Orden de la lista (más reciente primero) |

### pedido_detalle (lectura para el cliente)

| Campo | Tipo | Uso en esta feature |
|-------|------|---------------------|
| `id` | INT | PK |
| `pedido_id` | INT | FK → `pedido(id)` (`fk_pedido_detalle_pedido`) ON DELETE CASCADE |
| `menu_dia_id` | INT | FK → `menu_dia(id)`; enlaza con el platillo del día |
| `cantidad` | INT | Cantidad de la línea (`chk_pedido_detalle_cantidad`) |
| `precio_unitario` | DECIMAL(10,2) | Precio congelado (`chk_pedido_detalle_precio`) |
| `subtotal` | DECIMAL(10,2) | `cantidad × precio_unitario` (`chk_pedido_detalle_subtotal`) |

## Reglas de validación (derivadas de los requisitos)

- **Propiedad**: toda consulta de pedidos filtra por `usuario_id` de la sesión; un pedido ajeno
  se trata como **no encontrado** (404), no como prohibido (403).
- **Listado**: ordenado por `creado_en` descendente; incluye `numero`, `estado` (nombre),
  `total`, `tipo`, `fecha_recoleccion` y `creado_en`.
- **Detalle**: incluye los datos del pedido y sus líneas (`platillo` = nombre del platillo del
  `menu_dia`, `cantidad`, `precio_unitario`, `subtotal`) más el `total` del pedido.
- **Vista de notificación**: `PATCH /notificaciones/{id}/vista` solo puede marcar como vista una
  notificación cuyo `pedido.usuario_id` sea el de la sesión.
- **Tipo de notificación**: el aviso de pedido listo usa `tipo = 'pedido_listo'`; `canal` MUST
  ser `'correo'`, `'push'` o `'sms'`.
- **Estado de envío**: solo `'pendiente'`, `'enviada'` o `'fallida'`; `detalle_error` se llena
  únicamente cuando el estado es `'fallida'`.

## Relaciones

```text
usuario (1) ──< pedido (N)            vía pedido.usuario_id
pedido  (1) ──< pedido_detalle (N)    vía pedido_detalle.pedido_id (ON DELETE CASCADE)
pedido  (1) ──< notificacion (N)      vía notificacion.pedido_id (ON DELETE CASCADE)
pedido  (N) ──  estado_pedido (1)     vía pedido.estado_id
```

Un pedido puede tener varias notificaciones en su ciclo (por ejemplo, una `'fallida'` y luego
una `'enviada'` del mismo `tipo`, o tipos distintos a futuro), pero a lo sumo una por
`(pedido_id, tipo)` gracias a la unicidad añadida.

## Modelo de lectura expuesto a la API

### PedidoResumen (lista)

`id`, `numero`, `tipo`, `estado` (nombre), `total`, `fecha_recoleccion`, `creado_en`.

### PedidoDetalle

Todo `PedidoResumen` más `lineas[]`: cada línea con `platillo` (nombre), `cantidad`,
`precio_unitario`, `subtotal`.

### Notificacion

`id`, `pedido_id`, `numero` (folio del pedido), `tipo`, `canal`, `estado_envio`, `fecha`,
`vista` (booleano) y `detalle_error` (solo informativo, acotado).

## Estado e invariantes

- El **estado del pedido** solo cambia por transiciones válidas de `transicion_estado`
  (Sprint 4); ninguna notificación lo modifica.
- Una notificación `'fallida'` NO revierte ni altera `pedido.estado_id`; su reintento es
  independiente y no duplica avisos por la unicidad `(pedido_id, tipo)`.
- El cliente nunca recibe datos de otros usuarios: el filtro por `usuario_id` es parte de toda
  consulta de pedidos y de notificaciones.
