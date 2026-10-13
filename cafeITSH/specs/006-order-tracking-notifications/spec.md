# Feature Specification: Seguimiento, notificaciones y cierre (Sprint 5)

**Feature Branch**: `006-order-tracking-notifications`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 5 del roadmap (`Docs/sprints.md`): el cliente ve el recorrido completo de su
pedido y recibe el aviso de listo; cierre del MVP con pruebas y demo final. Subconjunto de la
spec maestra `specs/001-advance-order-system/spec.md` (US5 + pulido).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar el estado de mis pedidos (Priority: P1)

Un alumno o docente abre "mis pedidos" y ve la lista de sus pedidos con el estado actual y el
detalle de cada uno (platillos, cantidades y total).

**Why this priority**: Da transparencia al cliente sobre el avance de su pedido y cierra la
experiencia anticipada.

**Independent Test**: Un cliente con pedidos previos ve su lista con el estado actualizado y
el detalle de cada pedido.

**Acceptance Scenarios**:

1. **Given** un cliente con pedidos previos, **When** abre "mis pedidos", **Then** ve la lista
   con el estado actual de cada pedido.
2. **Given** un pedido propio, **When** el cliente abre su detalle, **Then** ve platillos,
   cantidades y total.
3. **Given** un pedido que cambia de estado, **When** el cliente vuelve a consultar,
   **Then** ve el estado actualizado.
4. **Given** un cliente, **When** consulta sus pedidos, **Then** solo ve los suyos, no los de
   otros clientes.

---

### User Story 2 - Recibir la notificación de pedido listo (Priority: P1)

Un alumno o docente recibe una notificación cuando su pedido pasa a "Listo", para saber que ya
puede recogerlo.

**Why this priority**: Es el objetivo explícito del producto (avisar cuando el pedido está
listo) y reduce la espera y las preguntas en mostrador.

**Independent Test**: Cuando un pedido pasa a "Listo", el cliente recibe una notificación de
que ya puede recogerlo.

**Acceptance Scenarios**:

1. **Given** un pedido del cliente en estado "En preparación", **When** el pedido pasa a
   "Listo", **Then** el cliente recibe una notificación de que ya puede recogerlo.
2. **Given** una notificación enviada, **When** esta falla en el canal externo, **Then** el
   estado del pedido no se corrompe y queda registrado para reintento.
3. **Given** un pedido "Listo" que el cliente recoge, **When** se marca como "Entregado",
   **Then** el estado del pedido se actualiza para el cliente.

---

### User Story 3 - Cierre y demostración del MVP (Priority: P2)

El equipo completa el pulido de interfaz, las pruebas críticas pendientes y presenta una
demostración del flujo completo a la patrocinadora.

**Why this priority**: Consolida la entrega del MVP y valida la aceptación con la
patrocinadora.

**Independent Test**: Se demuestra el flujo completo (menú → selección → pedido → pago →
cocina → preparación → listo → notificación → recogida) con las pruebas críticas en verde.

**Acceptance Scenarios**:

1. **Given** el sistema completo, **When** se ejecuta el flujo principal, **Then** se completa
   de principio a fin según el criterio de aceptación de la spec maestra.
2. **Given** las pruebas del proyecto, **When** se ejecutan, **Then** las pruebas de estados,
   pagos y permisos están en verde.
3. **Given** el pulido de interfaz, **When** se revisa contra los tokens de diseño, **Then** la
   interfaz es responsiva y legible en caja y cocina.

---

### Edge Cases

- Notificación emitida cuando el pedido pasa a "Listo" por más de una vía.
- Falla del servicio externo de notificación (debe degradar sin corromper el pedido).
- Cliente con varios pedidos y notificaciones simultáneas.
- Intento de ver el detalle de un pedido de otro cliente.
- Estado del pedido actualizado entre dos consultas del cliente.
- Reintento de notificación sin duplicar avisos al cliente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los clientes MUST poder consultar la lista de sus pedidos y el estado actual de
  cada uno.
- **FR-002**: Los clientes MUST poder consultar el detalle de un pedido (platillos,
  cantidades y total).
- **FR-003**: Un cliente MUST poder ver únicamente sus propios pedidos.
- **FR-004**: El sistema MUST notificar al cliente cuando su pedido pase a "Listo".
- **FR-005**: La funcionalidad de notificaciones MUST mantenerse separada de la lógica
  principal de pedidos.
- **FR-006**: El sistema MUST tolerar la falla del servicio de notificación sin corromper el
  estado del pedido.
- **FR-007**: El sistema MUST permitir demostrar el flujo de aceptación completo de la spec
  maestra (menú → selección → pedido → pago → cocina → preparación → listo → notificación →
  recogida).

### Key Entities *(include if feature involves data)*

- **Notificación**: Aviso enviado al cliente cuando su pedido está listo; operado de forma
  independiente de la lógica de pedidos.
- **Pedido**: Solicitud con su estado actual y detalle.
- **Detalle de pedido**: Cada línea con platillo, cantidad y precio aplicado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los pedidos que llegan a "Listo" genera el aviso al usuario.
- **SC-002**: El flujo completo (menú → selección → pedido → pago → cocina → preparación →
  listo → notificación → recogida) es demostrable de principio a fin.
- **SC-003**: Las pruebas de estados, pagos y permisos están en verde (Vitest).
- **SC-004**: El 100 % de los intentos de un cliente por ver pedidos ajenos son bloqueados.
- **SC-005**: La interfaz de caja y cocina es responsiva y legible según los tokens de diseño.

## Assumptions

- El resto del sistema (sprints 1–4) está implementado y disponible.
- El canal de notificación será al menos en-app; puede apoyarse en un servicio externo cuando
  esté disponible.
- El pulido se guía por los tokens de diseño de referencia del proyecto.
- Están fuera de alcance: reseñas, inventario y puntos de lealtad.

## Trazabilidad a spec 001

- Historia: US5 (Seguimiento y notificación del pedido) más el pulido y las pruebas críticas.
- FRs de la maestra cubiertos: FR-026, FR-027, FR-036 y FR-037, y el criterio de aceptación
  completo de la spec maestra.
- Fuera de alcance: funcionalidades fuera del MVP.
