# Data Model: Gestión y consulta del menú (Sprint 2)

Fuente de verdad del esquema (`database/migrations/001_crear_esquema.sql` y
`002_seed_inicial.sql`). Acceso con SQL parametrizado vía `mysql2`; sin ORM.

## Entidades

### platillo

Catálogo maestro de platillos de la cafetería.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `categoria` | VARCHAR(50) | NULL |
| `descripcion` | TEXT | NULL |
| `activo` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE |

**Notas**: `activo = 0` es un retiro lógico del catálogo (no aparece en el menú).

### menu_dia

Asocia platillos a una fecha con precio congelado y banderas de disponibilidad/especial.

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `fecha` | DATE | NOT NULL |
| `platillo_id` | INT | NOT NULL, FK → `platillo(id)` (`fk_menu_dia_platillo`) |
| `precio` | DECIMAL(10,2) | NOT NULL |
| `disponible` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `especial` | TINYINT(1) | NOT NULL, DEFAULT 0 |

**Restricciones de tabla (citadas de la migración)**:
- `UNIQUE KEY uq_menu_dia_fecha_platillo (fecha, platillo_id)` — un platillo sólo una vez por
  fecha.
- `CONSTRAINT chk_menu_dia_precio CHECK (precio >= 0)`.
- Índice `idx_menu_dia_fecha ON menu_dia(fecha)`.

**Relaciones**: `menu_dia.platillo_id` → `platillo.id` (N:1).

## Modelo de lectura para el cliente

La vista `/menu` se sirve con una consulta por fecha que une `menu_dia` y `platillo`
(`platillo.activo = 1`), devolviendo por cada ítem: `platilloId`, `nombre`, `categoria`,
`descripcion`, `precio`, `disponible`, `especial`.

## Reglas de validación (de los requisitos)

- **nombre**: obligatorio, 1–100 caracteres.
- **precio**: obligatorio, numérico, `>= 0`, máximo 2 decimales.
- **fecha**: obligatoria, formato `YYYY-MM-DD`.
- **disponible / especial**: booleanos.
- No se admite duplicar `(fecha, platillo_id)` (rechazar con `409`).
- Un platillo con `activo = 0` no debe poder agregarse a un menú nuevo.
- La consulta del cliente debe marcar los `disponible = 0` como no disponibles y no permitir su
  selección para pedir.

## Invariantes

- Un cambio de precio aplica sólo al `menu_dia` de la fecha indicada; no altera menús pasados.
- `platillo.activo = 0` lo excluye del menú servido a clientes sin borrar su historial.
