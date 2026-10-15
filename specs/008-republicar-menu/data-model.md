# Data Model: Republicar el menú del día en un clic

**Feature**: `008-republicar-menu` | **Date**: 2026-10-14

No se crean tablas ni columnas nuevas. La funcionalidad reutiliza `menu_dia`.

## Entidades reutilizadas

### `menu_dia` (sin cambios de esquema)

| Columna | Tipo | Notas |
|--------|------|-------|
| `id` | INT PK | Identificador del ítem |
| `fecha` | DATE | Fecha del menú |
| `platillo_id` | INT FK → `platillo.id` | Platillo publicado |
| `precio` | DECIMAL(10,2) | Precio del día (se copia tal cual) |
| `disponible` | TINYINT(1) | Disponibilidad del día |
| `especial` | TINYINT(1) | Marca de “especial” |

- **Restricción clave**: `UNIQUE (fecha, platillo_id)` — garantiza que republicar sea idempotente
  (no puede haber dos ítems del mismo platillo en la misma fecha).

### `platillo` (lectura)

- Se usa `platillo.activo = 1` para decidir qué ítems del origen son copiables.
- También se respeta al agregar manualmente (regla ya existente en `menu.service.agregar`).

## Operación de dominio: republicar

**Entrada**: `fecha` destino (opcional; por defecto la fecha actual).

**Derivados**:
- `origen` = `MAX(menu_dia.fecha) WHERE fecha <> destino` (si no existe → error `404`).
- `origenTotal` = número de ítems del origen cuyo platillo está activo.
- `agregados` = filas insertadas por el `INSERT ... SELECT` (platillos activos del origen que aún
  no estaban en el destino).
- `omitidos` = `origenTotal - agregados` (ya existían en el destino).

**Resultado** (`ResultadoRepublicacion`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `fecha` | string (`YYYY-MM-DD`) | Fecha destino |
| `origen` | string (`YYYY-MM-DD`) | Fecha del menú fuente |
| `agregados` | number ≥ 0 | Ítems nuevos agregados |
| `omitidos` | number ≥ 0 | Ítems del origen ya presentes en el destino |

**Invariantes**:
- `agregados + omitidos = origenTotal` (ítems activos del origen considerados).
- Ejecutar dos veces con el mismo destino produce `agregados = 0` en la segunda.
- Ningún `platillo` inactivo en el origen se copia.

## Máquina de estados / permisos

- No aplica máquina de estados: `menu_dia` no tiene estados.
- Permiso: solo `administrador` puede invocar la operación (igual que el resto de la gestión del
  menú).
