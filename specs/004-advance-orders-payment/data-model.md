# Data Model: Pedido anticipado y pago (Sprint 3)

Fuente de verdad de `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql`.
Acceso con SQL parametrizado vía `mysql2`; sin ORM.

## Entidades

### pedido

Cabecera del pedido. Un pedido anticipado nace en estado `Pendiente` y pasa a `Pagado`.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(20) | NOT NULL, UNIQUE (`uq_pedido_numero`) |
| `usuario_id` | INT | NOT NULL, FK → `usuario(id)` |
| `tipo` | ENUM('anticipado','mostrador') | NOT NULL, DEFAULT 'anticipado' |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` (default `Pendiente`) |
| `total` | DECIMAL(10,2) | NOT NULL |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Restricciones**: `CONSTRAINT chk_pedido_total CHECK (total >= 0)`. Índices para búsquedas por
`usuario_id`, `estado_id` y `creado_en`.

### pedido_detalle

Líneas del pedido con precio congelado.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` (`fk_detalle_pedido`), ON DELETE CASCADE |
| `platillo_id` | INT | NOT NULL, FK → `platillo(id)` |
| `cantidad` | INT | NOT NULL |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL |
| `subtotal` | DECIMAL(10,2) | NOT NULL |

**Restricciones**: `CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0)` y
`chk_detalle_subtotal CHECK (subtotal >= 0)`.

### pago

Registro del intento/confirmación de pago.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` (`fk_pago_pedido`) |
| `metodo` | ENUM('en_linea','efectivo') | NOT NULL |
| `monto` | DECIMAL(10,2) | NOT NULL |
| `estado` | ENUM('pendiente','aprobado','rechazado') | NOT NULL |
| `referencia` | VARCHAR(100) | NULL |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Restricciones**: `CONSTRAINT chk_pago_monto CHECK (monto >= 0)`.

### estado_pedido (catálogo sembrado)

| id | nombre |
|----|--------|
| 1 | Pendiente |
| 2 | Pagado |
| 3 | En preparación |
| 4 | Listo |
| 5 | Entregado |
| 0 | Cancelado |

### transicion_estado (catálogo sembrado)

Pares `estado_origen_id` → `estado_destino_id` válidos. Esta feature usa
`Pendiente (1) → Pagado (2)`.

### pedido_estado_historial

Bitácora de cambios de estado: `id`, `pedido_id` (FK), `estado_anterior_id`,
`estado_nuevo_id`, `usuario_id`, `creado_en`. Se inserta una fila en cada transición.

## Reglas de validación (de los requisitos)

- El pedido debe tener al menos una línea; cada `cantidad` es entero positivo.
- Cada `platillo_id` debe existir en el menú de hoy (`menu_dia`) y estar `disponible = 1`.
- El precio de línea se toma del `menu_dia` y **no** se confía en el precio enviado por el
  cliente.
- `total` = suma de `subtotal` de todas las líneas.
- El pedido sólo se crea dentro de la ventana de pedido anticipado.
- Sólo pasa a `Pagado` mediante la transición válida `Pendiente → Pagado` y con `pago.estado =
  'aprobado'`.

## Invariantes

- Un pedido `Pagado` tiene exactamente un `pago.estado = 'aprobado'` con `monto = pedido.total`.
- Los precios de línea nunca cambian tras crear el pedido (congelados).
- No se duplican transiciones ni pagos aprobados por reintentos (idempotencia).
