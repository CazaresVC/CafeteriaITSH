# Data Model: Mostrador y cocina (Sprint 4)

Fuente de verdad del esquema (`database/migrations/001_crear_esquema.sql` y
`002_seed_inicial.sql`). El acceso es SQL parametrizado con `mysql2`; no hay ORM. Este sprint
**no crea migraciones nuevas**: reutiliza las tablas de pedidos, pagos y estados ya existentes.

## Entidades

### pedido

Solicitud de uno o más platillos. Tanto los anticipados como los de mostrador viven aquí; el
origen se distingue por `tipo`. El estado actual SIEMPRE vive en `estado_id`.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(20) | NOT NULL, UNIQUE (`uq_pedido_numero`) |
| `tipo` | VARCHAR(20) | NOT NULL, CHECK `tipo IN ('anticipado', 'mostrador')` |
| `estado_id` | INT | NOT NULL, FK → `estado_pedido(id)` (`fk_pedido_estado`) |
| `usuario_id` | INT | NULL, FK → `usuario(id)` (`fk_pedido_usuario`) |
| `cliente_nombre` | VARCHAR(100) | NULL |
| `fecha_recoleccion` | DATETIME | NULL |
| `total` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK `(total >= 0)` |
| `creado_por` | INT | NULL, FK → `usuario(id)` (`fk_pedido_creado_por`) |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**Restricción de origen** (citada literalmente de la migración):

```sql
CONSTRAINT chk_pedido_anticipado CHECK (
  (tipo = 'anticipado' AND usuario_id IS NOT NULL AND fecha_recoleccion IS NOT NULL)
  OR (tipo = 'mostrador')
)
```

**Índices**: `idx_pedido_estado (estado_id)`, `idx_pedido_fecha_recoleccion
(fecha_recoleccion)`, `idx_pedido_usuario (usuario_id)`, `idx_pedido_tipo (tipo)`.

**Reglas de este sprint**:
- Un pedido de mostrador se crea con `tipo='mostrador'`, `usuario_id = NULL`,
  `fecha_recoleccion = NULL`, `cliente_nombre` opcional y `creado_por = cajero`.
- `numero` (folio) es único y se genera en el servidor.
- `total` se calcula como la suma de los `subtotal` de `pedido_detalle`.

### pedido_detalle

Cada línea de un pedido con el platillo del menú, la cantidad y el precio unitario congelado.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` ON DELETE CASCADE (`fk_pedido_detalle_pedido`) |
| `menu_dia_id` | INT | NOT NULL, FK → `menu_dia(id)` (`fk_pedido_detalle_menu_dia`) |
| `cantidad` | INT | NOT NULL, CHECK `(cantidad > 0)` |
| `precio_unitario` | DECIMAL(10,2) | NOT NULL, CHECK `(precio_unitario >= 0)` |
| `subtotal` | DECIMAL(10,2) | NOT NULL, CHECK `(subtotal >= 0)` |

**Índice**: `idx_pedido_detalle_pedido (pedido_id)`.

**Reglas**: `precio_unitario` se congela desde `menu_dia.precio` al crear el pedido;
`subtotal = precio_unitario × cantidad`. No se permiten `cantidad <= 0` (FR de la spec).

### pago

Un pago por pedido, por el monto completo. Sin datos de tarjeta. En este sprint el método es
`efectivo`.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, UNIQUE (`uq_pago_pedido`), FK → `pedido(id)` (`fk_pago_pedido`) |
| `metodo` | VARCHAR(20) | NOT NULL, CHECK `metodo IN ('online', 'efectivo')` |
| `monto` | DECIMAL(10,2) | NOT NULL, CHECK `(monto > 0)` |
| `referencia` | VARCHAR(100) | NULL |
| `registrado_por` | INT | NULL, FK → `usuario(id)` (`fk_pago_usuario`) |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Índice**: `idx_pago_pedido (pedido_id)`. **UNIQUE `uq_pago_pedido (pedido_id)`** garantiza un
solo cobro por pedido.

**Reglas**: el cobro de mostrador inserta `metodo='efectivo'`, `monto = pedido.total`,
`registrado_por = cajero`. El registro exitoso del pago es lo que habilita la transición
`Pendiente → Pagado` (FR-007).

### estado_pedido

Catálogo de estados y su orden de avance.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE (`uq_estado_pedido_nombre`) |
| `orden` | INT | NOT NULL, UNIQUE (`uq_estado_pedido_orden`) |

**Valores sembrados** (`002_seed_inicial.sql`):

| `nombre` | `orden` |
|----------|---------|
| `Pendiente` | 1 |
| `Pagado` | 2 |
| `En preparación` | 3 |
| `Listo` | 4 |
| `Entregado` | 5 |
| `Cancelado` | 0 |

> `Cancelado` tiene `orden = 0` porque es un estado terminal fuera del flujo principal.

### transicion_estado

Transiciones válidas entre estados. **Es la fuente de verdad de la máquina de estados**
(validación por datos).

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `desde_id` | INT | NOT NULL, PK compuesta con `hacia_id`, FK → `estado_pedido(id)` (`fk_transicion_desde`) |
| `hacia_id` | INT | NOT NULL, PK compuesta, FK → `estado_pedido(id)` (`fk_transicion_hacia`) |

**Restricción** (citada literalmente de la migración):

```sql
PRIMARY KEY (desde_id, hacia_id),
CONSTRAINT chk_transicion_distintos CHECK (desde_id <> hacia_id)
```

**Transiciones sembradas** (`002_seed_inicial.sql`):

| desde | hacia |
|-------|-------|
| `Pendiente` | `Pagado` |
| `Pagado` | `En preparación` |
| `En preparación` | `Listo` |
| `Listo` | `Entregado` |
| `Pendiente` | `Cancelado` |
| `Pagado` | `Cancelado` |
| `En preparación` | `Cancelado` |
| `Listo` | `Cancelado` |

**Regla**: una transición es válida si y solo si existe la fila `(desde_id, hacia_id)`. Como no
existe ninguna fila con `desde_id` de `Entregado` o `Cancelado`, **ningún pedido terminal puede
cambiar de estado** (FR-004/FR-022).

### pedido_estado_historial

Auditoría de cada cambio de estado.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `pedido_id` | INT | NOT NULL, FK → `pedido(id)` ON DELETE CASCADE (`fk_historial_pedido`) |
| `estado_anterior_id` | INT | NULL, FK → `estado_pedido(id)` (`fk_historial_anterior`) |
| `estado_nuevo_id` | INT | NOT NULL, FK → `estado_pedido(id)` (`fk_historial_nuevo`) |
| `cambiado_por` | INT | NULL, FK → `usuario(id)` (`fk_historial_usuario`) |
| `fecha` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Índice**: `idx_historial_pedido (pedido_id)`.

**Reglas**: cada transición exitosa inserta una fila con `estado_anterior_id` = estado previo,
`estado_nuevo_id` = estado destino y `cambiado_por = usuario.id` de la sesión, en la misma
transacción SQL que actualiza `pedido.estado_id`. `estado_anterior_id` es NULL solo si no
hubiera estado previo (no aplica en este sprint: el pedido nace `Pendiente`).

## Máquina de estados (derivada del seed)

```text
Pendiente → Pagado → En preparación → Listo → Entregado
     │          │            │           │
     └──────────┴────────────┴───────────┴──→ Cancelado
```

- `Entregado` y `Cancelado` son terminales: sin transiciones de salida.
- Se rechazan saltos (p. ej. `Pagado → Listo`) y cambios sobre estados terminales.

## Reglas de validación (de los requisitos)

- **Ítems**: al menos una línea; `cantidad > 0`; `menu_dia_id` debe existir y estar
  `disponible = 1` en la fecha vigente (FR-018/FR-004 de la spec de este sprint).
- **Precios**: el servidor obtiene `precio_unitario` de `menu_dia.precio`; nunca del cliente.
- **Total**: `total = Σ(precio_unitario × cantidad)`, `>= 0`.
- **Cobro**: un solo pago por pedido; `monto > 0`; `metodo = 'efectivo'`.
- **Transición**: debe existir en `transicion_estado`; de lo contrario `409`.
- **Autoría**: `creado_por`, `registrado_por` y `cambiado_por` se derivan de la sesión.

## Estado e invariantes

- Todo pedido tiene siempre un `estado_id` válido (FK) — FR-019.
- El estado solo cambia mediante transiciones registradas en `transicion_estado`, y cada cambio
  queda auditado en `pedido_estado_historial` — FR-021/FR-022.
- Un pedido de mostrador nunca tiene `usuario_id` ni `fecha_recoleccion` (por
  `chk_pedido_anticipado`); un anticipado siempre los tiene.
- Un pedido en `Entregado` o `Cancelado` no admite más cambios.
