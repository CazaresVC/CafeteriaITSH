# Feature Specification: Gestión y consulta del menú (Sprint 2)

**Feature Branch**: `003-menu-management`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 2 del roadmap (`Docs/sprints.md`): el administrador publica el menú del día
(platillos, precios, disponibilidad y especiales) y los clientes lo consultan. Subconjunto de
la spec maestra `specs/001-advance-order-system/spec.md` (US7 + US1).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar el menú, platillos y precios (Priority: P1)

El administrador crea y edita platillos, define y modifica precios, configura los especiales
del día, arma el menú diario y marca platillos como no disponibles.

**Why this priority**: Sin menú publicado no hay nada que consultar ni sobre lo que pedir; es
el requisito habilitante del sprint.

**Independent Test**: Un administrador autenticado publica platillos con precio, los marca
como no disponibles y configura un especial del día, y el menú refleja esos cambios.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea o edita un platillo y define su
   precio, **Then** el platillo queda disponible en el menú según su disponibilidad.
2. **Given** un administrador, **When** marca un platillo como no disponible, **Then** el
   platillo no puede seleccionarse para nuevos pedidos y se refleja en el menú del cliente.
3. **Given** un administrador, **When** configura un especial del día, **Then** aparece
   destacado para los clientes.
4. **Given** un administrador, **When** modifica el precio de un platillo, **Then** el nuevo
   precio se refleja para los clientes.
5. **Given** un administrador, **When** define el menú del día, **Then** los clientes ven ese
   conjunto de platillos como el menú vigente.

---

### User Story 2 - Consultar el menú del día (Priority: P1)

Un alumno o docente abre el menú del día y ve platillos, precios, disponibilidad y especiales,
de forma rápida incluso en horarios de receso y desde el móvil.

**Why this priority**: Es la puerta de entrada a la decisión de compra y el valor inmediato
para el cliente final.

**Independent Test**: Un visitante puede abrir el menú del día y ver platillos, precios,
disponibilidad y especiales; los cambios publicados por el administrador se reflejan de
inmediato.

**Acceptance Scenarios**:

1. **Given** un menú del día publicado, **When** un cliente abre la consulta de menú,
   **Then** ve los platillos con su precio y disponibilidad y los especiales del día.
2. **Given** un platillo marcado como no disponible, **When** se muestra en el menú,
   **Then** aparece claramente como no disponible y no puede seleccionarse.
3. **Given** un cambio de precio o disponibilidad publicado por el administrador,
   **When** un cliente vuelve a consultar el menú, **Then** ve la información actualizada.

---

### Edge Cases

- Menú del día sin platillos publicados (estado vacío).
- Platillo marcado como no disponible mientras un cliente está consultando el menú.
- Cambio de precio entre dos consultas consecutivas del mismo cliente.
- Dos platillos con el mismo nombre o precios en cero/negativos (deben validarse).
- Consulta del menú en móvil con alta concurrencia durante el receso.
- Especial del día para una fecha distinta a la del menú vigente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El administrador MUST poder crear y modificar el menú diario.
- **FR-002**: El administrador MUST poder crear, editar y gestionar los platillos.
- **FR-003**: El administrador MUST poder asignar y modificar precios.
- **FR-004**: El administrador MUST poder gestionar los especiales del día.
- **FR-005**: El administrador MUST poder marcar platillos como no disponibles.
- **FR-006**: Un platillo no disponible MUST NOT poder seleccionarse en nuevos pedidos.
- **FR-007**: Los clientes MUST poder consultar el menú del día con platillos, precios,
  disponibilidad y especiales del día.
- **FR-008**: Los cambios publicados en el menú MUST reflejarse de inmediato para los usuarios
  finales.
- **FR-009**: El sistema MUST validar los datos de platillos y precios antes de almacenarlos
  (por ejemplo, precios válidos y campos obligatorios).

### Key Entities *(include if feature involves data)*

- **Platillo**: Producto ofrecible de la cafetería; tiene nombre, precio y estado de
  disponibilidad.
- **Menú diario**: Conjunto de platillos y precios vigentes para un día.
- **Especial del día**: Platillo destacado para una fecha determinada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los platillos no disponibles aparece identificado como tal y no
  puede seleccionarse.
- **SC-002**: El 100 % de los cambios de precio o disponibilidad se reflejan en la consulta
  del cliente de inmediato.
- **SC-003**: El menú se consulta sin esperas perceptibles en horario de receso desde el móvil.
- **SC-004**: Cero platillos almacenados con datos inválidos (nombre, precio o disponibilidad).

## Assumptions

- El administrador cuenta con credenciales válidas provistas por el Sprint 1.
- La consulta del menú es pública para clientes autenticados según la fundación del Sprint 1.
- El diseño visual se apoya en los tokens de referencia del proyecto.
- Pedidos, carrito y pagos quedan fuera de este sprint.

## Trazabilidad a spec 001

- Historias: US7 (Gestionar menú, platillos y precios) y US1 (Consultar el menú del día).
- FRs de la maestra cubiertos: FR-007 a FR-014.
- Fuera de alcance: pedidos, carrito y pagos (sprints 3–4).
