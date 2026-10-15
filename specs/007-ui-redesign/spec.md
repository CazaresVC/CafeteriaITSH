# Feature Specification: Tokens de diseño (DESIGN.md) en el frontend

**Feature Branch**: `007-ui-redesign`

**Created**: 2026-10-14

**Status**: Draft

**Input**: Aplicar el sistema de diseño canónico `Docs/DESIGN.md` (paleta, tipografía,
radios y espaciado) al frontend como tokens de Tailwind, de forma aditiva y sin cambiar
comportamiento, navegación, rutas ni lógica de negocio. Alcance acotado a los tokens: la
navegación (drawer/bottom bar) y el rediseño de pantallas de las propuestas `desing/`
quedan fuera de esta spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tokens base del sistema de diseño (Priority: P1)

Quien desarrolla y quien usa la aplicación ve la identidad visual de la cafetería
(verde institucional, fondo crema, tipografía, radios) definida como tokens del proyecto,
en lugar de los colores por defecto del framework, sin que cambie ninguna pantalla ni
comportamiento.

**Why this priority**: Es la base del pulido de UI del Sprint 5; sin los tokens definidos
no puede hablarse de un sistema de diseño consistente en el resto de la interfaz.

**Independent Test**: Existen los tokens de `DESIGN.md` como custom properties del
proyecto y el fondo, el texto y la tipografía globales de la aplicación los consumen; la
aplicación compila y las pruebas siguen en verde.

**Acceptance Scenarios**:

1. **Given** el frontend actual con colores por defecto, **When** se aplican los tokens de
   `DESIGN.md`, **Then** el tema global (superficie, texto y tipografía) usa dichos tokens.
2. **Given** los tokens definidos, **When** se compilan las utilidades de estilo, **Then**
   los nombres de token (colores, fuentes, radios) están disponibles para los componentes.
3. **Given** la aplicación con tokens, **When** se ejecutan `typecheck`, `test`, `lint` y
   `build`, **Then** todo permanece en verde y ninguna funcionalidad cambia.

---

### User Story 2 - Componentes base y layout con tokens (Priority: P2)

Quien usa la aplicación percibe botones, tarjetas, campos de formulario y el encabezado del
layout con la identidad visual del proyecto (acción primaria en verde, superficies crema y
blancas, radios y foco definidos), conservando exactamente el mismo comportamiento y los
mismos puntos de navegación.

**Why this priority**: Los componentes compartidos son los que dan coherencia visual a
todas las pantallas; aplicarlos después de los tokens produce una mejora visible sin tocar
la lógica.

**Independent Test**: Los componentes base y el encabezado del layout usan los tokens;
sus variantes y su API pública no cambian y las pantallas que los usan siguen funcionando
igual.

**Acceptance Scenarios**:

1. **Given** el componente de botón, **When** se renderiza su variante primaria, **Then**
   usa el verde institucional con texto blanco; las variantes existentes se conservan.
2. **Given** una tarjeta y un campo de entrada, **When** se muestran, **Then** usan las
   superficies, bordes y foco del sistema de diseño.
3. **Given** el encabezado del layout por rol, **When** se muestra, **Then** usa las
   superficies y el color de texto de los tokens sin alterar sus enlaces ni su estructura.

---

### User Story 3 - Colores de estado de pedido con tokens (Priority: P3)

Quien usa la aplicación ve las insignias de estado de pedido (Pendiente, Pagado, En
preparación, Listo, Entregado, Cancelado) con los colores definidos por el sistema de
diseño, de forma consistente entre cocina y las pantallas del cliente.

**Why this priority**: Unifica la lectura del estado del pedido en todos los roles; es un
refinamiento posterior a la base visual.

**Independent Test**: Las insignias de estado en cocina y en "mis pedidos" usan los tokens
de color de estado definidos en `DESIGN.md` y muestran el mismo color para el mismo estado
en ambas pantallas.

**Acceptance Scenarios**:

1. **Given** un pedido "Listo", **When** se muestra en cocina y en "mis pedidos",
   **Then** ambas insignias usan el mismo color de estado del sistema de diseño.
2. **Given** un pedido en cualquier estado válido, **When** se muestra su insignia,
   **Then** el color corresponde al token de ese estado y el texto es legible.

---

### Edge Cases

- Las fuentes de `DESIGN.md` no están disponibles en el dispositivo: debe aplicarse la
  pila de respaldo **sin** bloquear la interfaz ni depender obligatoriamente de la red.
- Definir los radios de `DESIGN.md` cambia también las utilidades de radio existentes:
  el cambio es intencional y no debe romper la apariencia funcional de ningún componente.
- El proyecto es solo modo claro: no se define tema oscuro.
- Coexistencia de clases de color por defecto con los nuevos tokens: ambas deben seguir
  generándose para no romper pantallas aún no migradas.
- Un componente con un color de estado desconocido: debe degradar a un color neutro legible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El frontend MUST definir los tokens de `Docs/DESIGN.md` (colores, tipografía,
  radios y espaciado) como custom properties del sistema de diseño del proyecto.
- **FR-002**: El tema global de la aplicación (fondo, color de texto y tipografía base)
  MUST consumir dichos tokens.
- **FR-003**: Los componentes base compartidos (botón, tarjeta, entrada y etiqueta) MUST
  usar los tokens, conservando sus variantes y su API pública actual.
- **FR-004**: El encabezado del layout por rol MUST usar los tokens de superficie y texto,
  sin alterar su estructura ni sus enlaces de navegación.
- **FR-005**: Las insignias de estado de pedido MUST usar los colores de estado definidos en
  `DESIGN.md`, de forma consistente entre las pantallas de cocina y del cliente.
- **FR-006**: La aplicación MUST seguir siendo responsiva y conservar el área táctil mínima
  de 44 px en caja y cocina.
- **FR-007**: La aplicación MUST NOT incorporar dependencias npm nuevas.
- **FR-008**: La aplicación MUST NOT modificar la navegación, las rutas, la lógica de
  negocio ni el backend.

### Key Entities *(include if feature involves data)*

- **Token de diseño**: Valor de color, tipografía, radio o espaciado del sistema de diseño,
  expuesto como custom property del proyecto y consumido por utilidades y componentes.
- **Componente base**: Elemento de interfaz compartido (botón, tarjeta, entrada, etiqueta)
  cuya apariencia pasa a usar tokens conservando su API.
- **Insignia de estado**: Indicador visual del estado de un pedido, coloreado con el token
  del estado correspondiente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `typecheck`, `test`, `lint` y `build` del frontend permanecen en verde.
- **SC-002**: El 100 % de los componentes base y del encabezado del layout afectados dejan
  de usar colores por defecto del framework para sus colores principales (0 clases de color
  por defecto en esos archivos).
- **SC-003**: El mismo estado de pedido muestra el mismo color en cocina y en la vista del
  cliente (100 % de coincidencia).
- **SC-004**: Ningún archivo fuera de `frontend/` es modificado por esta funcionalidad.
- **SC-005**: Ninguna dependencia npm nueva se agrega al proyecto.

## Assumptions

- `Docs/DESIGN.md` es la fuente de verdad de los tokens; no se redefine la identidad visual
  en esta funcionalidad.
- Las fuentes de `DESIGN.md` se declaran con una pila de respaldo del sistema; una fuente web
  es opcional y, si se usa, debe incluir respaldo local para no depender de la conectividad.
- El alcance es solo modo claro y solo presentación: no se cambian vistas de datos, permisos
  ni endpoints.
- Quedan **fuera de alcance** (propuestas en `desing/`, requieren aprobación §27): navegación
  por drawer/bottom bar, rediseño de pantallas, historial de ventas, métodos de pago con
  tarjeta/transferencia, descuentos, imágenes de platillo, métricas de admin y notificaciones
  push.
- El resto del sistema (sprints 1–5) está implementado y disponible.

## Trazabilidad a spec 001 y al roadmap

- Se apoya en el pulido de UI del Sprint 5 (`Docs/sprints.md`, criterio "pulido de interfaz
  conforme a los tokens de diseño").
- Requisitos de interfaz de la constitución (§II/§19): UI responsiva, área táctil ≥ 44 px,
  alto contraste y navegación simple.
- Sin FRs funcionales nuevos de la spec maestra: no se altera ningún flujo; todo es
  presentación (FR-013/014, FR-016 y FR-026/027 permanecen intactas en comportamiento).
- Fuera de alcance: funcionalidades fuera del MVP y los elementos de `desing/` no listados
  en la User Stories de esta spec.
