# Data Model: Pedido anticipado y pago (Sprint 3)

Fuente de verdad de `database/migrations/001_crear_esquema.sql` y `002_seed_inicial.sql`.
Acceso con SQL parametrizado vía `mysql2`; sin ORM. Esta feature **no** crea migraciones nuevas.

## Entidades

### pedido

Cabecera del pedido. Un pedido anticipado nace en estado `Pendiente` y pasa a `Pagado`.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(20) | NOT NULL, UNIQUE (`uq_pedido_numero`) |
| `tipo` | VARCHAR(20) | NOT NULL, CHECK `IN ('anticipado','mostrador')` |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` |
| `usuario_id` | INT | NULL, FK → `usuario(id)` (obligatorio para `anticipado`) |
| `cliente_nombre` | VARCHAR(100) | NULL (pedidos de mostrador) |
| `fecha_recoleccion` | DATETIME | NULL (obligatorio para `anticipado`) |
| `total` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK `total >= 0` |
| `creado_por` | INT | NULL, FK → `usuario(id)` |
| `creado_en` / `actualizado_en` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

**Restricciones**: `chk_pedido_anticipado` exige `usuario_id` y `fecha_recoleccion` no nulos
cuando `tipo = 'anticipado'`. Índices por `estado_id`, `usuario_id`, `fecha_recoleccion` y `tipo`.

### pedido_detalle

Líneas del pedido con precio congelado. Cada línea apunta a una entrada de `menu_dia`.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` (`fk_pedido_detalle_pedido`), ON DELETE CASCADE |
| `menu_dia_id` | INT | NOT NULL, FK → `menu_dia(id)` (`fk_pedido_detalle_menu_dia`) |
| `cantidad` | INT | NOT NULL, CHECK `cantidad > 0` |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL, CHECK `>= 0` |
| `subtotal` | DECIMAL(10,2) | NOT NULL, CHECK `>= 0` |

**Nota**: el cliente envía `platilloId`; el backend lo resuelve contra el `menu_dia` de hoy y guarda
el `menu_dia_id` junto con el precio tomado del servidor.

### pago

Registro del pago confirmado. La tabla admite **un pago por pedido** (`uq_pago_pedido`).

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, UNIQUE, FK → `pedido(id)` (`fk_pago_pedido`) |
| `metodo` | VARCHAR(20) | NOT NULL, CHECK `IN ('online','efectivo')` |
| `monto` | DECIMAL(10,2) | NOT NULL, CHECK `monto > 0` |
| `referencia` | VARCHAR(100) | NULL (identificador de la pasarela) |
| `registrado_por` | INT | NULL, FK → `usuario(id)` |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Decisión MVP**: `pago` **no** tiene columna `estado`; sólo se persiste el pago **aprobado**. Un
pago rechazado por la pasarela se responde con `422 PAGO_RECHAZADO` y **no** inserta fila, por lo que
puede reintentarse. El método de entrada `en_linea` se almacena como `online`.

### estado_pedido (catálogo sembrado)

| id | nombre |
|----|--------|
| 1 | Pendiente |
| 2 | Pagado |
| 3 | En preparación |
| 4 | Listo |
| 5 | Entregado |
| 6 | Cancelado |

### transicion_estado (catálogo sembrado)

Pares `desde_id` → `hacia_id` válidos. Esta feature usa `Pendiente (1) → Pagado (2)`.

### pedido_estado_historial

Bitácora de cambios de estado: `id`, `pedido_id` (FK), `estado_anterior_id`, `estado_nuevo_id`,
`cambiado_por` (FK → `usuario`), `fecha`. Se inserta una fila en cada transición.

## Reglas de validación (de los requisitos)

- El pedido debe tener al menos una línea; cada `cantidad` es entero positivo (1–99).
- Cada `platillo_id` debe existir en el menú de hoy (`menu_dia`), con `disponible = 1` y el
  `platillo.activo = 1`.
- El precio de línea se toma del `menu_dia` y **no** se confía en el precio enviado por el cliente.
- `total` = suma de `subtotal` de todas las líneas.
- El pedido sólo se crea dentro de la ventana de pedido anticipado (`PEDIDO_VENTANA_INICIO/FIN`),
  con al menos `PEDIDO_ANTICIPACION_MIN` minutos de anticipación.
- Sólo pasa a `Pagado` mediante la transición válida `Pendiente → Pagado` y con un cobro aprobado.

## Invariantes

- Un pedido `Pagado` tiene exactamente un `pago` con `monto = pedido.total`.
- Los precios de línea nunca cambian tras crear el pedido (congelados).
- No se duplican pagos ni transiciones por reintentos (idempotencia por estado `Pagado`).
