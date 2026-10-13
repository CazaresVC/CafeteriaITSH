# Research: Gestión y consulta del menú (Sprint 2)

Decisiones técnicas que resuelven los "NEEDS CLARIFICATION" del plan. Todas respetan la
constitución y evitan dependencias innecesarias.

## 1. Modelado del menú diario

- **Decision**: Usar la tabla `menu_dia` (una fila por `fecha` + `platillo_id`) con
  `precio` DECIMAL(10,2) congelado al agregar el platillo al menú, y `disponible` / `especial`
  como banderas booleanas. `platillo` es el catálogo maestro.
- **Rationale**: El precio congelado por día da historial y evita que un cambio de precio altere
  pedidos pasados; `uq_menu_dia_fecha_platillo` evita duplicados.
- **Alternatives considered**: precio único en `platillo` (pierde historial de precios);
  tabla de menús como entidad separada (sobre-modelado para el MVP).

## 2. Disponibilidad: catálogo vs día

- **Decision**: `platillo.activo` controla si un platillo pertenece al catálogo (soft delete);
  `menu_dia.disponible` controla si está disponible para pedir en una fecha concreta. "Marcar
  como no disponible" (FR-005/FR-006) se resuelve con `menu_dia.disponible = 0`.
- **Rationale**: Separa retirar un producto del catálogo de venderlo agotado un día.
- **Alternatives considered**: una sola bandera (no distingue ambos casos de negocio).

## 3. Reflejo inmediato de cambios

- **Decision**: La consulta del menú lee directamente de la BD por `fecha`; el frontend
  invalida/refresca la query al volver a la pantalla (TanStack Query con `staleTime` corto, p.
  ej. 30 s) y no se introduce caché de servidor que retrase los cambios.
- **Rationale**: Cumple FR-014 ("los cambios se reflejan de inmediato") con complejidad mínima.
- **Alternatives considered**: CDN/caché (retrasaría cambios); websockets (innecesario).

## 4. Optimización de la consulta del menú

- **Decision**: Consulta única por fecha que une `menu_dia` con `platillo`, filtrando
  `platillo.activo = 1`; se apoya en el índice existente `idx_menu_dia_fecha` y en
  `uq_menu_dia_fecha_platillo`.
- **Rationale**: Una sola round-trip sirve toda la vista; cumple SC-003 (rapidez en receso).
- **Alternatives considered**: consultas por platillo (N+1).

## 5. Validación de precios y datos

- **Decision**: `zod` con `precio` numérico ≥ 0 y hasta 2 decimales, `nombre` 1–100, `fecha`
  ISO `YYYY-MM-DD`; se valida en el backend (fuente de verdad) y se reutiliza en formularios.
- **Rationale**: Cumple §14 y la restricción `chk_menu_dia_precio`.
- **Alternatives considered**: validación manual duplicada.

## 6. Autorización

- **Decision**: Rutas de gestión (`/platillos`, `/menu`) protegidas con
  `requireRole('administrador')`; la consulta del menú requiere sesión (`requireAuth`) y está
  disponible para todos los roles.
- **Rationale**: Cumple §5 y §16; reutiliza middlewares del Sprint 1.
- **Alternatives considered**: verificación de rol por controlador (duplicación).

## 7. Especiales del día

- **Decision**: `menu_dia.especial = 1` marca el especial de una fecha; la consulta los
  destaca con un campo derivado (`especial: true`) sin tabla adicional.
- **Rationale**: Suficiente para el MVP y ya previsto en el esquema.
- **Alternatives considered**: tabla `especial_dia` separada (innecesaria).

## 8. Estrategia de pruebas

- **Decision**: Vitest + supertest para endpoints (CRUD, validación de precio, disponibilidad,
  consulta por fecha) y Vitest + RTL para la consulta del cliente (los no disponibles aparecen
  identificados y no seleccionables).
- **Rationale**: Cubre la lógica crítica exigida por §20 (gestión del menú).
- **Alternatives considered**: sólo pruebas manuales.

## 9. Cómo correr (dev)

- **Decision**: Backend `tsx watch src/server.ts`; frontend `vite`; mismo `.env` del Sprint 1.
- **Rationale**: Consistencia con el resto del proyecto.
