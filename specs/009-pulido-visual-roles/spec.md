# Feature Specification: Pulido visual por rol

**Feature Branch**: `009-pulido-visual-roles`

**Created**: 2026-10-14

**Status**: Draft

**Input**: Hacer que las cuatro experiencias de rol (administrador, caja, cocina, cliente) se vean
**atractivas y coherentes** con el sistema de diseño (`Docs/DESIGN.md`) y que cada rol tenga la
funcionalidad visual que le corresponde, **sin** rediseñar la navegación ni tocar el backend. Se
añaden componentes visuales reutilizables (badges, estados vacíos, tarjetas de cifra, *stepper*,
encabezados de página, diálogo de confirmación, iconos) y pequeñas mejoras de rol que usan
endpoints ya existentes: vista **Entregas** de caja y **Editar usuario** de administración.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experiencias atractivas y coherentes por rol (Priority: P1)

Cada rol que abre la aplicación ve pantallas con jerarquía clara, estados vacío/carga/error
presentables y componentes consistentes (badges, tarjetas, cifras), en vez de párrafos planos.

**Why this priority**: Es el objetivo del feature: subir la calidad percibida y la legibilidad sin
cambiar el flujo.

**Independent Test**: Recorrer las pantallas de cada rol y comprobar que todas las listas vacías
usan un estado ilustrado, las tablas tienen encabezado y filas legibles, y los estados de pedido
se muestran como badges del color de `DESIGN.md`.

**Acceptance Scenarios**:

1. **Given** una lista sin datos (usuarios, platillos, menú, pedidos), **When** el usuario la abre,
   **Then** ve un `EmptyState` con ilustración, mensaje y CTA cuando aplique.
2. **Given** una tabla del admin, **When** se muestra, **Then** tiene encabezado destacado, filas
   altas y números/badges legibles.
3. **Given** un pedido, **When** se muestra su estado, **Then** aparece como badge pill del color
   correspondiente (`status-*`).

---

### User Story 2 - El rol de caja cumple con su función (Priority: P2)

El cajero no solo captura y cobra: ve y entrega los pedidos `Listo` desde una vista **Entregas**
con contador, sin salir de su módulo.

**Why this priority**: Completa funcionalmente el rol de caja usando `GET /pedidos?estado=Listo`
y `PATCH /pedidos/:id/estado`, ya existentes.

**Independent Test**: Con un pedido en estado `Listo`, la vista Entregas lo muestra y permite
marcarlo `Entregado` o `Cancelado`.

**Acceptance Scenarios**:

1. **Given** pedidos en `Listo`, **When** el cajero abre `/caja/entregas`, **Then** los ve con
   folio, hora, cliente y partidas, y un contador en la navegación.
2. **Given** un pedido listo, **When** el cajero pulsa *Entregar*, **Then** el pedido pasa a
   `Entregado` y desaparece de la lista.
3. **Given** la lista vacía, **When** no hay pedidos listos, **Then** ve un estado "todo al día".

---

### User Story 3 - Administración edita operativos (Priority: P3)

El administrador puede **editar** un usuario operativo (nombre, correo, rol, contraseña opcional)
usando `PATCH /usuarios/:id`, que ya existe.

**Why this priority**: Mejora de rol acotada y sin backend nuevo.

**Independent Test**: Cambiar el nombre de un operativo y ver el listado actualizado.

**Acceptance Scenarios**:

1. **Given** un usuario operativo, **When** el admin pulsa *Editar* y guarda, **Then** el listado
   refleja los cambios.

### Edge Cases

- Lista vacía por filtro vs. lista realmente vacía (mensajes distintos).
- Estados de pedido en carga/error: se muestran sin romper el layout.
- Acciones destructivas (deshabilitar usuario, quitar del menú) con confirmación.
- Áreas táctiles ≥ 44 px en caja y cocina.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Se MUST añadir componentes reutilizables de presentación: badge/chip, estado vacío,
  tarjeta de cifra, *stepper*, encabezado de página y diálogo de confirmación, sin dependencias npm
  nuevas (§22).
- **FR-002**: Todas las pantallas MUST usar los tokens de `Docs/DESIGN.md` (colores, tipografía y
  radios) y eliminar valores de color ad-hoc.
- **FR-003**: Los estados de pedido MUST representarse con el componente de badge usando los
  colores `status-*`.
- **FR-004**: Las listas sin datos MUST mostrar un estado vacío consistente (ilustración + mensaje
  + CTA cuando aplique) en los cuatro roles.
- **FR-005**: El rol de caja MUST ofrecer una vista **Entregas** (`/caja/entregas`) que lista los
  pedidos `Listo` y permite marcarlos `Entregado` o `Cancelado`, con contador en la navegación.
- **FR-006**: La administración MUST permitir **editar** usuarios operativos vía `PATCH
  /usuarios/:id` existente.
- **FR-007**: La funcionalidad MUST NOT modificar el backend ni el esquema, y MUST NOT introducir
  rutas nuevas más allá de `/caja/entregas`.
- **FR-008**: La lógica crítica de las mejoras de rol (transición de estado desde Entregas,
  edición de usuario) MUST conservar las reglas y permisos existentes.

### Key Entities

- Reutiliza entidades existentes: `Usuario`, `Platillo`, `MenuItem`, `Pedido`/`LineaPedido`,
  `EstadoPedido`. No se crean entidades de datos.

## Success Criteria *(mandatory)*

- **SC-001**: El 100% de las listas vacías de los cuatro roles usan el estado vacío consistente.
- **SC-002**: Ningún componente o página contiene colores fuera de los tokens de `DESIGN.md`.
- **SC-003**: La vista Entregas permite entregar/cancelar pedidos `Listo` con las mismas reglas de
  estado del backend (sin cambios).
- **SC-004**: `typecheck`, `lint`, `test` (26+) y `build` del frontend permanecen en verde.
- **SC-005**: Sin dependencias npm nuevas; `backend/` y `database/` sin cambios.

## Assumptions

- Se conserva la navegación actual (tabs) y el conjunto de pantallas; solo se añade
  `/caja/entregas` y el botón *Editar* en usuarios.
- Las mejoras usan exclusivamente endpoints existentes.
- Queda **fuera de alcance**: drawer/bottom bar, métricas o historial de ventas, configuración,
  imágenes de platillo, métodos de pago múltiples/descuentos, notificaciones push/SMS y hora de
  recolección elegible (todos requieren backend o aprobación §27).
