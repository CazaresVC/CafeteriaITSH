# Feature Specification: Pedido anticipado y pago (Sprint 3)

**Feature Branch**: `004-advance-orders-payment`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 3 del roadmap (`Docs/sprints.md`): el alumno/docente completa el pedido
anticipado con pago y nacen los estados de pedido. Subconjunto de la spec maestra
`specs/001-advance-order-system/spec.md` (US2).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un pedido anticipado (Priority: P1)

Un alumno o docente selecciona uno o más platillos del menú del día indicando cantidades,
revisa el total y confirma el pedido, respetando la anticipación mínima y la disponibilidad de
los platillos.

**Why this priority**: Es la creación del pedido, pieza central del producto; sin ella no hay
nada que pagar ni preparar.

**Independent Test**: Un cliente autenticado arma un pedido con platillos disponibles y una
anticipación de al menos 10 minutos, y el sistema registra el pedido en estado "Pendiente"
mostrando el total.

**Acceptance Scenarios**:

1. **Given** un cliente autenticado con el menú del día disponible, **When** selecciona
   platillos y cantidades y confirma con al menos 10 minutos de anticipación, **Then** el
   sistema crea el pedido en estado "Pendiente" y muestra el total.
2. **Given** un cliente que intenta confirmar con menos de 10 minutos de anticipación,
   **When** confirma, **Then** el sistema rechaza la creación y explica el mínimo requerido.
3. **Given** un pedido con un platillo marcado como no disponible, **When** el cliente intenta
   confirmarlo, **Then** el sistema impide incluirlo y no permite continuar.
4. **Given** un pedido en armado, **When** el cliente revisa antes de confirmar, **Then** ve el
   total calculado a partir de precios y cantidades.

---

### User Story 2 - Pagar el pedido anticipado (Priority: P1)

Un alumno o docente paga en línea su pedido anticipado y, al confirmarse el pago, el pedido
pasa a "Pagado" y queda disponible para preparación.

**Why this priority**: El pago cierra el flujo anticipado y es lo que evita filas y errores de
cobro; es el objetivo de negocio del sprint.

**Independent Test**: Un pedido "Pendiente" con pago confirmado pasa a "Pagado"; si el pago no
se confirma, el pedido permanece "Pendiente".

**Acceptance Scenarios**:

1. **Given** un pedido "Pendiente", **When** el cliente completa el pago en línea
   satisfactoriamente, **Then** el pedido pasa a "Pagado".
2. **Given** un pedido "Pendiente" cuyo pago falla o se cancela, **When** el cliente abandona
   el pago, **Then** el pedido no pasa a "Pagado" y el cliente puede reintentar o cancelarlo.
3. **Given** un pedido "Pagado", **When** se confirma, **Then** queda disponible para
   preparación (cola de cocina) con su folio y detalle.
4. **Given** un pago confirmado, **When** el sistema lo registra, **Then** no almacena datos
   sensibles de la tarjeta del cliente.

---

### Edge Cases

- Pedido confirmado con exactamente 10 minutos de anticipación (permitido) frente a 9 minutos
  (rechazado).
- Platillo que pasa a no disponible entre la selección y la confirmación del pedido.
- Pago interrumpido por pérdida de conectividad: el pedido no debe quedar inconsistente.
- Pago duplicado o reintento tras una confirmación ya registrada.
- Dos clientes comprando el último platillo disponible al mismo tiempo.
- Cancelación de un pedido anticipado antes de ser entregado.
- Falla del servicio externo de pago: el estado del pedido no debe corromperse.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los clientes MUST poder seleccionar uno o más platillos del menú del día y sus
  cantidades.
- **FR-002**: El sistema MUST mostrar el total del pedido antes de confirmarlo.
- **FR-003**: El sistema MUST permitir crear pedidos anticipados únicamente con al menos 10
  minutos de anticipación y MUST rechazar los que tengan menos.
- **FR-004**: El sistema MUST impedir incluir platillos no disponibles en un pedido.
- **FR-005**: Cada pedido MUST tener siempre un estado que refleje su progreso; en este sprint
  los estados son "Pendiente" y "Pagado".
- **FR-006**: El sistema MUST permitir el pago en línea como parte del flujo de realización
  del pedido anticipado.
- **FR-007**: Un pedido anticipado MUST pasar a "Pagado" únicamente cuando el pago se confirme.
- **FR-008**: El sistema MUST NOT almacenar datos sensibles de tarjetas bancarias y MUST
  registrar únicamente la información necesaria para identificar y validar la transacción.
- **FR-009**: El sistema MUST generar una identificación (folio) del pedido visible para el
  cliente tras su confirmación.
- **FR-010**: Un pedido "Pagado" MUST quedar disponible para su preparación con su detalle
  (platillos y cantidades).

### Key Entities *(include if feature involves data)*

- **Pedido**: Solicitud de uno o más platillos; tiene un cliente, un tipo (anticipado), un
  estado ("Pendiente"/"Pagado"), un total, un folio y fecha/hora.
- **Detalle de pedido**: Cada línea de un pedido con platillo, cantidad y precio aplicado.
- **Pago**: Registro de la transacción asociada a un pedido, sin datos sensibles de tarjeta.
- **Estado de pedido**: Valor del progreso; en este sprint, "Pendiente" y "Pagado".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los intentos con menos de 10 minutos de anticipación son rechazados
  con un mensaje claro.
- **SC-002**: El 100 % de los pedidos sin pago confirmado permanece en "Pendiente" (ninguno
  pasa a "Pagado" indebidamente).
- **SC-003**: El 100 % de los pedidos "Pagado" queda disponible para preparación con su
  detalle y folio.
- **SC-004**: Cero pedidos creados con platillos no disponibles o con datos inválidos.
- **SC-005**: El cliente completa selección, confirmación y pago en menos de 3 minutos en
  condiciones normales.

## Assumptions

- El menú del día y los platillos provienen del Sprint 2.
- El pago se realiza mediante un servicio externo; el sistema solo registra lo necesario para
  identificar y validar la transacción.
- El listado completo de "mis pedidos" con seguimiento en vivo llega en el Sprint 5.
- Mostrador y cocina quedan fuera de este sprint.

## Trazabilidad a spec 001

- Historia: US2 (Realizar un pedido anticipado con pago).
- FRs de la maestra cubiertos: FR-015 a FR-020 (solo estados "Pendiente"/"Pagado") y FR-028 a
  FR-030.
- Fuera de alcance: seguimiento completo de "mis pedidos" (sprint 5), mostrador y cocina
  (sprint 4).
