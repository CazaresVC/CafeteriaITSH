# Feature Specification: Mostrador y cocina (Sprint 4)

**Feature Branch**: `005-counter-kitchen`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 4 del roadmap (`Docs/sprints.md`): operación interna — captura de mostrador
por el cajero y pantalla de cocina (KDS) con todos los estados operativos. Subconjunto de la
spec maestra `specs/001-advance-order-system/spec.md` (US3 + US4).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capturar y cobrar pedidos de mostrador (Priority: P1)

El cajero registra pedidos hechos presencialmente y gestiona su cobro, en paralelo con los
pedidos anticipados, con la menor cantidad de pasos posible.

**Why this priority**: Garantiza que la operación tradicional de mostrador no se interrumpa y
conviva con los pedidos anticipados; es el requisito operativo del sprint.

**Independent Test**: Un cajero autenticado captura un pedido de mostrador, lo cobra y este
entra a la misma cola de preparación que los pedidos anticipados.

**Acceptance Scenarios**:

1. **Given** un cliente en mostrador, **When** el cajero captura los platillos y cantidades,
   **Then** el sistema registra el pedido de mostrador con su total.
2. **Given** un pedido de mostrador registrado, **When** el cajero registra el cobro,
   **Then** el pedido pasa a "Pagado" y entra a la cola de preparación.
3. **Given** pedidos anticipados y de mostrador activos, **When** el cajero opera,
   **Then** ambos tipos se gestionan simultáneamente sin bloquearse entre sí.
4. **Given** un pedido de mostrador con un platillo no disponible, **When** el cajero intenta
   agregarlo, **Then** el sistema lo impide.

---

### User Story 2 - Preparar pedidos en la pantalla de cocina (Priority: P1)

El cocinero ve en una sola pantalla los pedidos entrantes (anticipados y de mostrador) con sus
productos y cantidades, identifica el orden de preparación y actualiza el estado a
"En preparación" y "Listo".

**Why this priority**: Es el punto donde el pedido se materializa; sin él la anticipación no se
traduce en un pedido listo a tiempo.

**Independent Test**: Un cocinero autenticado ve los pedidos pagados ordenados por llegada y
puede mover un pedido a "En preparación" y luego a "Listo".

**Acceptance Scenarios**:

1. **Given** pedidos en estado "Pagado", **When** el cocinero abre la pantalla de cocina,
   **Then** ve los pedidos con sus productos, cantidades y un orden de preparación claro.
2. **Given** un pedido "Pagado", **When** el cocinero lo toma, **Then** el estado pasa a
   "En preparación".
3. **Given** un pedido "En preparación", **When** el cocinero lo termina, **Then** el estado
   pasa a "Listo".
4. **Given** la pantalla de cocina abierta, **When** llegan nuevos pedidos, **Then** la lista
   se actualiza sin recarga manual.

---

### User Story 3 - Entrega y cancelación de pedidos (Priority: P2)

El personal marca un pedido "Listo" como "Entregado" cuando el cliente lo recoge, y puede
cancelar un pedido antes de que sea entregado.

**Why this priority**: Cierra y protege el ciclo de vida del pedido con transiciones válidas;
complementa la operación de caja y cocina.

**Independent Test**: Un pedido "Listo" puede marcarse como "Entregado", y un pedido en un
estado previo puede cancelarse; las transiciones inválidas se rechazan.

**Acceptance Scenarios**:

1. **Given** un pedido "Listo", **When** el personal lo entrega, **Then** el estado pasa a
   "Entregado" y ya no puede cambiar.
2. **Given** un pedido en un estado previo a "Entregado", **When** el personal lo cancela,
   **Then** el estado pasa a "Cancelado" y ya no puede cambiar.
3. **Given** un pedido "Pagado", **When** alguien intenta marcarlo directamente como "Listo",
   **Then** el sistema rechaza el salto de estado.

---

### Edge Cases

- Intento de saltar estados (por ejemplo, "Pendiente" → "Listo").
- Intento de modificar un pedido "Entregado" o "Cancelado".
- Cocina recibiendo pedidos anticipados y de mostrador de forma concurrente.
- Nuevo pedido que llega mientras el cocinero está actualizando otro estado.
- Dos operadores actualizando el mismo pedido al mismo tiempo.
- Pedido cancelado que ya estaba "En preparación".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada pedido MUST tener siempre un estado que refleje su progreso.
- **FR-002**: Los estados válidos MUST ser: Pendiente, Pagado, En preparación, Listo,
  Entregado y Cancelado.
- **FR-003**: El sistema MUST permitir únicamente las transiciones: Pendiente → Pagado,
  Pagado → En preparación, En preparación → Listo, Listo → Entregado, y cualquier estado
  previo a Entregado → Cancelado.
- **FR-004**: El sistema MUST impedir saltarse estados del flujo principal y MUST impedir
  cambiar el estado de un pedido Entregado o Cancelado.
- **FR-005**: El sistema MUST permitir operar simultáneamente pedidos anticipados y pedidos de
  mostrador.
- **FR-006**: El cajero MUST poder capturar pedidos realizados presencialmente en el mostrador
  con la menor cantidad de pasos posible.
- **FR-007**: El sistema MUST permitir registrar y gestionar el cobro de los pedidos de
  mostrador.
- **FR-008**: El cocinero MUST poder visualizar en una sola pantalla los pedidos entrantes
  (anticipados y de mostrador).
- **FR-009**: El sistema MUST mostrar al cocinero los productos y cantidades que deben
  prepararse.
- **FR-010**: El sistema MUST facilitar al cocinero identificar el orden de preparación de los
  pedidos.
- **FR-011**: El cocinero MUST poder cambiar el estado del pedido a "En preparación" y a
  "Listo".
- **FR-012**: La lista de pedidos de cocina MUST actualizarse para reflejar los pedidos
  entrantes y sus cambios de estado sin recarga manual.
- **FR-013**: El sistema MUST registrar qué origen tiene cada pedido (anticipado o mostrador)
  sin afectar su operación.

### Key Entities *(include if feature involves data)*

- **Pedido**: Solicitud de uno o más platillos; tiene origen (anticipado/mostrador), un estado,
  un total y fecha/hora.
- **Detalle de pedido**: Cada línea de un pedido con platillo, cantidad y precio aplicado.
- **Estado de pedido**: Valor del progreso y las transiciones permitidas.
- **Pago**: Registro del cobro asociado a un pedido de mostrador.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las transiciones inválidas (saltos de estado o cambios sobre
  Entregado/Cancelado) son rechazadas.
- **SC-002**: Caja y pedidos anticipados operan a la vez sin interferirse (0 bloqueos
  cruzados).
- **SC-003**: El 100 % de los pedidos entrantes (ambos orígenes) aparece en la pantalla de
  cocina ordenado por llegada.
- **SC-004**: La pantalla de cocina refleja nuevos pedidos y cambios de estado sin recarga
  manual.
- **SC-005**: El cocinero puede actualizar el estado de un pedido en 2 interacciones o menos.

## Assumptions

- Existen pedidos anticipados "Pagado" provenientes del Sprint 3.
- Los roles de cajero y cocinero están definidos y protegidos por el Sprint 1.
- El sistema de notificaciones al cliente no entra en este sprint.
- El listado "mis pedidos" del cliente llega en el Sprint 5.

## Trazabilidad a spec 001

- Historias: US3 (Visualizar y preparar pedidos en cocina) y US4 (Capturar y cobrar pedidos de
  mostrador).
- FRs de la maestra cubiertos: FR-019 a FR-025 y FR-031 a FR-035.
- Fuera de alcance: notificaciones al cliente y listado "mis pedidos" (sprint 5).
